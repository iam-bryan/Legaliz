from openai import OpenAI
import mysql.connector
import numpy as np
import pickle

client = OpenAI(api_key="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")

# Connect to DB
conn = mysql.connector.connect(
    host="localhost",
    user="u785536991_admin",
    password="TbcL&SFy9p/",
    database="u785536991_legal_case_db"
)
cursor = conn.cursor(dictionary=True)

# Get cases without embeddings
cursor.execute("SELECT id, full_text FROM public_cases WHERE embedding IS NULL")
cases = cursor.fetchall()

for case in cases:
    emb = client.embeddings.create(
        model="text-embedding-3-small",
        input=case["full_text"][:8000]  # limit to fit model
    ).data[0].embedding

    # Store as blob
    emb_blob = pickle.dumps(np.array(emb, dtype="float32"))
    cursor.execute("UPDATE public_cases SET embedding=%s WHERE id=%s", (emb_blob, case["id"]))

conn.commit()
cursor.close()
conn.close()
