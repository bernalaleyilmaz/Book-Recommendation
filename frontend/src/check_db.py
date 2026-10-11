import sqlite3
con = sqlite3.connect('books.db')
cur = con.cursor()
schema = cur.execute("PRAGMA table_info(books);").fetchall()
for col in schema:
    print(col)
con.close()