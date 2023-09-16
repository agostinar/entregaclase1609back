import { promises as fs } from "fs";
const express = require('express');
const app = express();
const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");


// Importa las rutas de cartRoutes.js
const cartRoutes = require('routes./cartRoutes'); 

// Usa las rutas de carritos en la aplicación
app.use('/api/carts', cartRoutes); // Define la base URL para las rutas de carritos

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
app.get("/", async (req, res) => {
    app.get("/", async (req, res) => {
        app.get("/", async (req, res) => {
            // Parsea los parámetros de consulta
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const sort = req.query.sort;
            const query = req.query.query; // Búsqueda general
            const category = req.query.category; // Búsqueda por categoría
            const availability = req.query.availability; // Búsqueda por disponibilidad
          
            // Calcula el índice de inicio para paginar
            const startIndex = (page - 1) * limit;
          
            let products;
          
            // Aplica el filtro si se proporciona
            if (query) {
              products = await Manager.searchProducts(query);
            } else if (category) {
              // Realiza la búsqueda por categoría
              products = await Manager.getProductsByCategory(category);
            } else if (availability) {
              // Realiza la búsqueda por disponibilidad
              products = await Manager.getProductsByAvailability(availability);
            } else {
              products = await Manager.getAllProducts();
            }
          
            // Ordena los productos si se proporciona el parámetro 'sort'
            if (sort === "asc") {
              products = products.sort((a, b) => a.price - b.price);
            } else if (sort === "desc") {
              products = products.sort((a, b) => b.price - a.price);
            }
          
            // Calcula el total de páginas
            const totalPages = Math.ceil(products.length / limit);
          
            // Obtiene la página actual
            const currentPage = page;
          
            // Verifica si hay una página anterior
            const hasPrevPage = currentPage > 1;
          
            // Verifica si hay una página siguiente
            const hasNextPage = currentPage < totalPages;
          
            // Calcula los índices de página previa y página siguiente
            const prevPage = hasPrevPage ? currentPage - 1 : null;
            const nextPage = hasNextPage ? currentPage + 1 : null;
          
            // Crea los enlaces directos a páginas previas y siguientes
            const prevLink = hasPrevPage
              ? `/api?page=${prevPage}&limit=${limit}&sort=${sort}&query=${query}&category=${category}&availability=${availability}`
              : null;
            const nextLink = hasNextPage
              ? `/api?page=${nextPage}&limit=${limit}&sort=${sort}&query=${query}&category=${category}&availability=${availability}`
              : null;
          
            // Obtiene los productos paginados
            const paginatedProducts = products.slice(startIndex, startIndex + limit);
          
            // Construye la respuesta con el formato deseado
            const response = {
              status: "success",
              payload: paginatedProducts,
              totalpages: totalPages,
              prevpage: prevPage,
              nextpage: nextPage,
              page: currentPage,
              hasprevpage: hasPrevPage,
              prevlink: prevLink,
              nextlink: nextLink,
            };
          
            res.json(response);
          });
          
        };
      
        res.json(response);
      });
      
    // Parsea los parámetros de consulta
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;
  
    // Calcula el índice de inicio para paginar
    const startIndex = (page - 1) * limit;
  
    let products;
  
    // Aplica el filtro si se proporciona
    if (query) {
      products = await Manager.searchProducts(query);
    } else {
      products = await Manager.getAllProducts();
    }
  
    // Ordena los productos si se proporciona el parámetro 'sort'
    if (sort === "asc") {
      products = products.sort((a, b) => a.price - b.price);
    } else if (sort === "desc") {
      products = products.sort((a, b) => b.price - a.price);
    }
  
    // Pagina los resultados
    const paginatedProducts = products.slice(startIndex, startIndex + limit);
  
    res.render("home", { products: paginatedProducts });
  });
  
  // DELETE api/carts/:cid/products/:pid
router.delete("/:cid/products/:pid", async (req, res) => {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
  
      // Encuentra el carrito por su ID
      const cart = await Cart.findById(cartId);
  
      if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
      }
  
      // Encuentra el índice del producto a eliminar en el arreglo de productos del carrito
      const productIndex = cart.products.findIndex((product) => product.equals(productId));
  
      if (productIndex === -1) {
        return res.status(404).json({ error: "Producto no encontrado en el carrito" });
      }
  
      // Elimina el producto del carrito
      cart.products.splice(productIndex, 1);
      await cart.save();
  
      res.json({ message: "Producto eliminado del carrito" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
// PUT api/carts/:cid
router.put("/:cid", async (req, res) => {
    try {
      const cartId = req.params.cid;
      const newProducts = req.body.products; // Debe ser un arreglo de referencias a productos
  
      // Actualiza el carrito con el nuevo arreglo de productos
      const cart = await Cart.findByIdAndUpdate(cartId, { products: newProducts }, { new: true });
  
      if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
      }
  
      res.json({ message: "Carrito actualizado exitosamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
// PUT api/carts/:cid/products/:pid
router.put("/:cid/products/:pid", async (req, res) => {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const newQuantity = req.body.quantity; // Cantidad nueva del producto
  
      // Encuentra el carrito por su ID
      const cart = await Cart.findById(cartId);
  
      if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
      }
  
      // Encuentra el producto en el carrito
      const product = cart.products.find((product) => product.equals(productId));
  
      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado en el carrito" });
      }
  
      // Actualiza la cantidad de ejemplares del producto
      product.quantity = newQuantity;
      await cart.save();
  
      res.json({ message: "Cantidad de ejemplares del producto actualizada" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
// DELETE api/carts/:cid
router.delete("/:cid", async (req, res) => {
    try {
      const cartId = req.params.cid;
  
      // Encuentra el carrito por su ID y elimina todos los productos
      await Cart.findByIdAndUpdate(cartId, { products: [] });
  
      res.json({ message: "Todos los productos del carrito han sido eliminados" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
        



