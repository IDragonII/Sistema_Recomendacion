import os
import json
import torch
import random
from datasets import Dataset
from sentence_transformers import SentenceTransformer, losses, InputExample
from sentence_transformers.sentence_transformer.training_args import SentenceTransformerTrainingArguments
from sentence_transformers.sentence_transformer.trainer import SentenceTransformerTrainer

BASE_MODEL = "BAAI/bge-m3"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models", "bge-m3-finetuned")
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

BATCH_SIZE = 8
EPOCHS = 2
LEARNING_RATE = 3e-5
WARMUP_STEPS = 50
MAX_SAMPLES = 600


def cargar_datos(archivo: str) -> list[dict]:
    with open(archivo, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def main():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Dispositivo: {device}")
    if device == "cuda":
        gpu_name = torch.cuda.get_device_name(0)
        vram = torch.cuda.get_device_properties(0).total_memory / 1024**3
        print(f"GPU: {gpu_name}")
        print(f"VRAM: {vram:.1f} GB")

    print(f"Cargando modelo base: {BASE_MODEL}")
    model = SentenceTransformer(BASE_MODEL, device=device)

    train_file = os.path.join(DATA_DIR, "train.json")
    valid_file = os.path.join(DATA_DIR, "valid.json")

    if not os.path.exists(train_file):
        print("ERROR: No se encontraron datos de entrenamiento.")
        print("Ejecuta primero: python fine_tuning/generate_data.py")
        return

    print(f"Cargando datos de entrenamiento: {train_file}")
    train_data = cargar_datos(train_file)

    if len(train_data) > MAX_SAMPLES:
        random.seed(42)
        train_data = random.sample(train_data, MAX_SAMPLES)
        print(f"Muestreados {MAX_SAMPLES} triplets para entrenamiento rapido")

    print(f"Triplets de train: {len(train_data)}")

    valid_data = []
    if os.path.exists(valid_file):
        valid_data = cargar_datos(valid_file)
        if len(valid_data) > 150:
            random.seed(42)
            valid_data = random.sample(valid_data, 150)
        print(f"Triplets de valid: {len(valid_data)}")

    train_dataset = Dataset.from_list([
        {"anchor": item["anchor"], "positive": item["positive"], "negative": item["negative"]}
        for item in train_data
    ])

    valid_dataset = None
    if valid_data:
        valid_dataset = Dataset.from_list([
            {"anchor": item["anchor"], "positive": item["positive"], "negative": item["negative"]}
            for item in valid_data
        ])

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    total_steps = (len(train_data) // BATCH_SIZE) * EPOCHS
    print(f"\nConfiguracion de entrenamiento:")
    print(f"  Batch size: {BATCH_SIZE}")
    print(f"  Epochs: {EPOCHS}")
    print(f"  Total steps: ~{total_steps}")
    print(f"  Tiempo estimado: ~{total_steps * 6 // 60} min (GPU)")

    args = SentenceTransformerTrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        learning_rate=LEARNING_RATE,
        warmup_steps=WARMUP_STEPS,
        fp16=(device == "cuda"),
        bf16=False,
        logging_steps=25,
        save_strategy="epoch",
        eval_strategy="epoch" if valid_dataset else "no",
        load_best_model_at_end=True if valid_dataset else False,
        metric_for_best_model="eval_loss" if valid_dataset else None,
        save_total_limit=2,
        dataloader_num_workers=0,
    )

    loss = losses.MultipleNegativesRankingLoss(model)

    trainer = SentenceTransformerTrainer(
        model=model,
        args=args,
        train_dataset=train_dataset,
        eval_dataset=valid_dataset,
        loss=loss,
    )

    print("\n=== Iniciando fine-tuning ===")
    trainer.train()

    print(f"\nGuardando modelo fine-tuneado en: {OUTPUT_DIR}")
    model.save_pretrained(OUTPUT_DIR)

    print("\n=== Fine-tuning completado ===")
    print(f"Modelo guardado en: {OUTPUT_DIR}")
    print("Siguiente paso: python cargar.py para regenerar ChromaDB")


if __name__ == "__main__":
    main()
