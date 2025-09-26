/**
 * Mock Data Loader Service
 * Provides utilities for loading and managing mock data
 */

export class MockDataLoader {
  private static mockData: Record<string, any> = {};

  static setData(key: string, data: any): void {
    this.mockData[key] = data;
  }

  static getData(key: string): any {
    return this.mockData[key];
  }

  static getAllData(): Record<string, any> {
    return { ...this.mockData };
  }

  static clearData(): void {
    this.mockData = {};
  }

  static loadFromJson(jsonData: Record<string, any>): void {
    this.mockData = { ...this.mockData, ...jsonData };
  }
}