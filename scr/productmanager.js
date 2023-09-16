import { promises as fs } from "fs";

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
        this.id = 1;
    }

    async loadProducts() {
        try {
            const data = await fs.readFile(this.path, "utf-8");
            this.products = JSON.parse(data);
        } catch (error) {
            this.products = [];
        }
    }

    async saveProducts() {
        await fs.writeFile(this.path, JSON.stringify(this.products), "utf-8");
    }

    addProduct({ title, description, price, thumbnail, code, stock }) {
        const verificarCode = this.products.some((product) => product.code === code);

        if (verificarCode) {
            console.log("El valor de code ya se encuentra asignado a otro producto");
        } else if (
            title &&
            description &&
            price &&
            thumbnail &&
            stock &&
            code
        ) {
            console.log("Producto cargado correctamente");
            const product = {
                title,
                description,
                price,
                thumbnail,
                code,
                stock,
                id: this.id,
            };
            this.products.push(product);
            this.id++;
            this.saveProducts();
        } else {
            console.log("Todos los parametros son requeridos");
        }
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        const result = this.products.find((product) => product.id === id);
        return result ? result : "Not found";
    }
}

class Product {
    constructor(title, description, price, thumbnail, code, stock) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
        this.id = Product.idIncrement();
    }

    static idIncrement() {
        if (this.idCounter) {
            this.idCounter++;
        } else {
            this.idCounter = 1;
        }
        return this.idCounter;
    }
}

const Manager = new ProductManager("./products.json");

(async () => {
    await Manager.loadProducts();

    console.log(Manager.getProducts());
    
    Manager.addProduct({
        title: "producto prueba",
        description: "Este es un producto prueba",
        price: 800,
        thumbnail: "Sin imagen",
        code: "aaaa123",
        stock: 10,
    });
    
    console.log(Manager.getProducts());
    
    Manager.addProduct({
        title: "producto prueba",
        description: "Este es un producto prueba",
        price: 800,
        thumbnail: "Sin imagen",
        code: "bbbb123",
        stock: 10,
    });
    
    console.log(Manager.getProductById(1));
    console.log(Manager.getProductById(8));
})();
