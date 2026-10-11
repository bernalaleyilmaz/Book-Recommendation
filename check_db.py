import sqlite3
con = sqlite3.connect('books.db')
cur = con.cursor()
tables = cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
print("Tablolar:", tables)
for (table_name,) in tables:
    count = cur.execute(f"SELECT COUNT(*) FROM {table_name};").fetchone()[0]
    print(f"{table_name}: {count} satir")
con.close()
