class Program {
    constructor() {
        this.products = [];
    }

    async initDb() {
        const rest = await fetch('https://fakestoreapi.com/products');
        const json = await rest.json();
        this.products = json;
    }

    buildTable() {
        const tableBody = document.querySelector("#productTable tbody");
        this.products.forEach(product => {
            this.addProductRow(tableBody, product.title, product.price);
        });
    }

    addProductRow(tableBody, productTitle, productPrice) {
        const row = document.createElement("tr");
        const cellName = document.createElement("td");
        const cellPrice = document.createElement("td");

        cellName.textContent = productTitle;
        cellPrice.textContent = `$${productPrice}`;

        row.appendChild(cellName);
        row.appendChild(cellPrice);

        tableBody.appendChild(row);
    }

    getOrderList() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    getOrderNumber() {
        return Number(localStorage.getItem('orderNumber')) || 1;
    }

    addOrder() {
        const container = document.getElementById("container");
        const order = {
            number: this.getOrderNumber(),
            total: 0,
            items: []
        };

        for (const child of container.children) {
            const selectedProduct = child.children[3];
            const quantityInput = child.children[7];
            const quantity = parseInt(quantityInput.value);

            if (selectedProduct.value !== "0" && quantity > 0) {
                const [productName, price] = selectedProduct.value.split("|");
                const unitPrice = parseFloat(price);

                order.items.push({
                    product: productName,
                    quantity
                });
                order.total += (unitPrice * quantity);
            }
        }

        if (order.items.length === 0) {
            return;
        }

        const orderList = this.getOrderList();
        orderList.push(order);
        const orderNumber = this.getOrderNumber();

        localStorage.setItem('orders', JSON.stringify(orderList));
        localStorage.setItem('orderNumber', orderNumber + 1);

        this.showOrders();
        this.initContainer();
    }

    showOrders() {
        const orderListElement = document.getElementById("orderList");
        orderListElement.innerHTML = "";

        const orderList = this.getOrderList();
        orderList.forEach((order) => {
            const listItem = document.createElement("li");
            let message = "";
            order.items.forEach(item => {
                message += `${item.product} x ${item.quantity}<br>`;
            });
            listItem.innerHTML = `Pedido #${order.number}:<br> ${message}Total: $${order.total}`;

            const deliverButton = document.createElement("button");
            deliverButton.textContent = "Entregar";
            deliverButton.addEventListener("click", async () => this.handleDelivery(order));

            listItem.appendChild(deliverButton);
            orderListElement.appendChild(listItem);
        });
    }

    handleDelivery(order) {
        Swal.fire({
            title: `¿Desea entregar el pedido #${order.number}?`,
            html: `${this.getOrderMessage(order)}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, entregar"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Entregado!",
                    text: `Has entregado el pedido #${order.number}`,
                    icon: "success"
                });

                const newOrderList = this.getOrderList().filter(item => item.number !== order.number);
                localStorage.setItem('orders', JSON.stringify(newOrderList));
                this.showOrders();
            }
        });
    }

    getOrderMessage(order) {
        let message = "";
        order.items.forEach(item => {
            message += `${item.product} x ${item.quantity}<br>`;
        });
        return `Total: $${order.total}<br>${message}`;
    }

    addEventListeners() {
        document.getElementById("accept-btn").addEventListener("click", () => this.addOrder());
        document.getElementById("reset").addEventListener("click", () => this.initContainer());
        document.getElementById("addOrderBtn").addEventListener("click", () => this.addNewProduct());
    }

    addNewProduct() {
        const container = document.getElementById("container");

        for (const child of container.children) {
            const selectedProduct = child.children[3];
            const quantityInput = child.children[7];
            if (selectedProduct.value === "0" || parseInt(quantityInput.value) <= 0) {
                return;
            }
        }

        const parent = document.createElement("div");

        const productLabel = document.createElement("label");
        productLabel.textContent = "Producto:";

        const selectProduct = document.createElement("select");
        selectProduct.classList.add("max-width-select");

        selectProduct.appendChild(new Option("Elige un producto", "0"));
        selectProduct[0].disabled = true;
        this.products.forEach(product => {
            const option = new Option(`${product.title} - $${product.price}`, product.title + "|" + product.price);
            selectProduct.appendChild(option);
        });

        const quantityLabel = document.createElement("label");
        quantityLabel.textContent = "Cantidad:";

        const inputQuantity = document.createElement("input");
        inputQuantity.type = "number";
        inputQuantity.min = "1";
        inputQuantity.value = "1";

        parent.appendChild(document.createElement("br"));
        parent.appendChild(document.createElement("br"));
        parent.appendChild(productLabel);
        parent.appendChild(selectProduct);
        parent.appendChild(document.createElement("br"));
        parent.appendChild(document.createElement("br"));
        parent.appendChild(quantityLabel);
        parent.appendChild(inputQuantity);

        container.appendChild(parent);
    }

    initContainer() {
        const container = document.getElementById("container");
        while (container.firstChild) {
            container.removeChild(container.lastChild);
        }
        this.addNewProduct();
    }

    initialize() {
        this.initContainer();
        this.buildTable();
        this.showOrders();
        this.addEventListeners();
    }
}

const program = new Program();
program.initDb().then(() => {
    program.initialize();
});