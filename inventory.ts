enum Fruit {
  Apples = "Apples",
  Bananas = "Bananas",
  Oranges = "Oranges",
}

export default class InventoryForecast {
  private inventory: { [product: string]: number } = {};
  private sales: { [product: string]: { quantity: number; dates: number[] } } = {};

  add(product: Fruit, quantity: number): void {
    if (this.inventory.hasOwnProperty(product)) {
      this.inventory[product] += quantity;
    } else {
      this.inventory[product] = quantity;
    }
  }

  sell(product: Fruit, quantity: number, saleDate?: Date): void {
    const date = (saleDate || new Date()).getTime();
    if (!this.inventory.hasOwnProperty(product)) {
      console.error(
        `Cannot sell ${product} as it does not exist in inventory.`
      );
    }

    const availableQuantity = this.inventory[product];

    if (quantity > availableQuantity) {
      console.error(
        `Cannot sell ${product}. Available quantity: ${availableQuantity}. Sale size: ${quantity}`
      );
    }

    this.inventory[product] -= quantity;

    if (this.sales.hasOwnProperty(product)) {
      this.sales[product].quantity += quantity;
      this.sales[product].dates.push(date);
    } else {
      this.sales[product] = { quantity, dates: [date] };
    }

    this.issueWarning(product);
  }

  issueWarning(product: Fruit): void {
    const inventoryLevel = this.inventory[product];
    const daysUntilChristmas = this.calculateDaysUntilChristmas();

    if (inventoryLevel < 20) {
      console.warn(`Warning: Inventory for ${product} is below 20.`);
    } if (inventoryLevel < 30 && daysUntilChristmas < 60) {
      console.warn(`Warning: Inventory for ${product} is below 30 and there are fewer than 60 days until Christmas.`);
    }
  }

  calculateDaysUntilChristmas(): number {
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const today = new Date();
    const christmas = new Date(today.getFullYear(), 11, 25);

    return Math.ceil((christmas.getTime() - today.getTime()) / ONE_DAY);
  }

  report(): void {
    const products = Object.keys(this.inventory).sort();
    console.log("Current Inventory:");

    for (const product of products) {
      const prediction = this.getPrediction(product);
      console.log(`${product}: ${this.inventory[product]}, ${prediction}`);
    }
  }

  public getPrediction(product: string): string {
    if (!this.sales.hasOwnProperty(product)) {
      return "No sales data available.";
    }

    const saleDates = this.sales[product].dates;

    if (saleDates.length < 2) {
      return "Insufficient data to predict.";
    }

    const totalDays = (saleDates[saleDates.length - 1] - saleDates[0]) / (1000 * 60 * 60 * 24);
    const rate = this.sales[product].quantity / totalDays; // items per day
    const daysRemaining = Math.ceil(this.inventory[product] / rate);
    const depletionDate = new Date(
      Date.now() + daysRemaining * 24 * 60 * 60 * 1000
    );
    const formattedDate = depletionDate.toLocaleDateString();

    return `Expected to run out on ${formattedDate}`;
  }
}

const tracker = new InventoryForecast();
tracker.add(Fruit.Apples, 50);
tracker.sell(Fruit.Apples, 50, new Date('2024-04-01'));
tracker.add(Fruit.Apples, 50);
tracker.sell(Fruit.Apples, 20, new Date('2024-07-01'));
tracker.add(Fruit.Apples, 50);
tracker.sell(Fruit.Apples, 60, new Date('2024-11-01'));

tracker.sell(Fruit.Oranges, 150);
tracker.report();
