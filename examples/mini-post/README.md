# Mini Post

Contoh ini menunjukkan pola retained DOM untuk daftar post sederhana:

* node dibuat sekali lalu dimutasi langsung
* insert post baru dilakukan dengan `prepend` tanpa re-render seluruh list
* aksi edit mengubah node yang sama (swap view/editor), bukan membuat subtree baru
* data tetap disimpan di signal sebagai source of truth

## Yang Didemokan

* Integrasi `setChildren`, `setText`, `setEvents` dari DOM++
* Pemisahan jalur mutasi UI dan jalur update store
* Operasi list tanpa diffing/virtual DOM

## Cara Menjalankan

Dari root project:

```bash
node examples/serve.js
```

Buka:

`http://localhost:3000/examples/mini-post/`
