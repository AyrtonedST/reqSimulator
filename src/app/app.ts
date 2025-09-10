import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- HTML para la vista de carga -->
    @if (loading()) {
      <div class="container">
        <div class="spinner"></div>
      </div>
    }

    <!-- HTML para la vista principal de la app -->
    @if (!loading()) {
      <div class="app-container">
        <div class="card">
          <div class="logo-container">
            <img src="https://placehold.co/100x100/3B82F6/FFFFFF?text=Logo" alt="Logo" class="logo" />
          </div>
          <h1 class="title">Simulador de Peticiones</h1>
          <p class="subtitle">
            Selecciona un endpoint para interactuar con la API en:
            <span class="url-endpoint">{{ CLOUDRUN_API_URL }}</span>
          </p>

          <div class="buttons-container">
            @if (endpoints().length > 0) {
              @for (endpoint of endpoints(); track endpoint) {
                <button
                  (click)="handleClick(endpoint)"
                  class="button"
                >
                  {{ endpoint }}
                </button>
              }
            } @else {
              <p class="error-text">No se encontraron endpoints disponibles.</p>
            }
          </div>

          @if (error()) {
            <div class="error-box">
              <strong>Error:</strong>
              <span style="margin-left: 8px;">{{ error() }}</span>
            </div>
          }

          <div class="response-box">
            <h2 class="response-title">Respuesta del Servidor</h2>
            @if (response()) {
              <pre class="preformatted-text">{{ response() }}</pre>
            } @else {
              <p class="placeholder-text">
                Haz clic en un botón para obtener una respuesta...
              </p>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .app-container {
      background-color: #f3f4f6;
      min-height: 100vh;
      font-family: sans-serif;
      color: #1f2937;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .card {
      background-color: #ffffff;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      width: 100%;
      max-width: 960px;
      transition: transform 0.3s ease;
    }
    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 32px;
    }
    .logo {
      border-radius: 50%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .title {
      font-size: 36px;
      font-weight: 800;
      text-align: center;
      margin-bottom: 16px;
      color: #2563eb;
    }
    .subtitle {
      text-align: center;
      font-size: 18px;
      margin-bottom: 32px;
      color: #4b5563;
    }
    .buttons-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      margin-bottom: 32px;
    }
    .button {
      padding: 12px 24px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 18px;
      background: linear-gradient(to right, #3b82f6, #4f46e5);
      color: #ffffff;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: none;
      cursor: pointer;
    }
    .response-box {
      margin-top: 32px;
      padding: 24px;
      background-color: #f9fafb;
      border-radius: 8px;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    }
    .response-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #2563eb;
    }
    .preformatted-text {
      white-space: pre-wrap;
      word-break: break-word;
      padding: 16px;
      background-color: #ffffff;
      border-radius: 6px;
      font-size: 14px;
      overflow-x: auto;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .placeholder-text {
      color: #6b7280;
      text-align: center;
    }
    .error-box {
      background-color: #fee2e2;
      border: 1px solid #fca5a5;
      color: #b91c1c;
      padding: 12px 16px;
      border-radius: 8px;
      position: relative;
      margin: 16px 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .error-text {
      color: #ef4444;
      text-align: center;
    }
    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #f3f4f6;
    }
    .spinner {
      animation: spin 1s linear infinite;
      border-radius: 50%;
      height: 64px;
      width: 64px;
      border-top: 4px solid #3b82f6;
      border-bottom: 4px solid #3b82f6;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
})
export class App {
  //readonly CLOUDRUN_API_URL = 'https://cloudrun-demo-838175488064.us-east4.run.app/';
  readonly CLOUDRUN_API_URL = 'https://34.54.185.15.nip.io/cloud-proxy/';
  endpoints = signal<string[]>([]);
  response = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    this.fetchEndpoints();
  }

  async fetchEndpoints() {
    try {
      const res = await fetch(this.CLOUDRUN_API_URL);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      this.endpoints.set(data.endpoints);
    } catch (e: any) {
      this.error.set("Failed to fetch endpoints. Please check the API URL and CORS settings.");
      console.error("Error fetching endpoints:", e);
    } finally {
      this.loading.set(false);
    }
  }

  async handleClick(endpoint: string) {
    this.loading.set(true);
    this.response.set('');
    this.error.set(null);
    try {
      const res = await fetch(`${this.CLOUDRUN_API_URL}${endpoint}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const text = await res.text();
      this.response.set(text);
    } catch (e: any) {
      this.error.set(`Failed to send request to ${endpoint}.`);
      console.error("Error sending request:", e);
    } finally {
      this.loading.set(false);
    }
  }
}
