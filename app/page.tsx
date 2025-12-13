"use client"

import { useEffect, useRef } from "react"

export default function Page() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Create a complete HTML document for the React app
    const htmlContent = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Toyfront Ecommerce</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
      }
      #root {
        min-height: 100vh;
      }
      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        text-align: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      .error-container h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      .error-container p {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        max-width: 600px;
      }
      .setup-steps {
        background: rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 2rem;
        max-width: 700px;
        margin: 2rem auto;
        text-align: left;
      }
      .setup-steps ol {
        margin: 0;
        padding-left: 1.5rem;
      }
      .setup-steps li {
        margin: 1rem 0;
        line-height: 1.6;
      }
      .setup-steps code {
        background: rgba(0,0,0,0.3);
        padding: 2px 8px;
        border-radius: 4px;
        font-family: monospace;
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="error-container">
        <h1>🚀 Toyfront Ecommerce</h1>
        <p>
          This is a headless ecommerce platform that connects to WordPress + WooCommerce.
          To see the full app in action, you need to set up your environment variables.
        </p>
        <div class="setup-steps">
          <h2>Quick Start Guide:</h2>
          <ol>
            <li>Set up your WordPress site with WooCommerce installed</li>
            <li>Generate WooCommerce REST API keys (Settings → Advanced → REST API)</li>
            <li>Add these environment variables in the <strong>Vars</strong> section of the sidebar:
              <ul style="margin-top: 0.5rem;">
                <li><code>VITE_API_BASE_URL</code> - Your WordPress URL + /wp-json</li>
                <li><code>VITE_WC_CONSUMER_KEY</code> - Your WooCommerce Consumer Key</li>
                <li><code>VITE_WC_CONSUMER_SECRET</code> - Your WooCommerce Consumer Secret</li>
              </ul>
            </li>
            <li>Or download the project and run locally:
              <ul style="margin-top: 0.5rem;">
                <li><code>npm install</code> or <code>yarn install</code></li>
                <li>Copy <code>.env.example</code> to <code>.env</code> and add your credentials</li>
                <li><code>npm run dev</code> or <code>yarn dev</code></li>
              </ul>
            </li>
          </ol>
        </div>
        <p style="margin-top: 2rem; opacity: 0.9;">
          📚 Check <strong>README.md</strong> and <strong>WORDPRESS_SETUP.md</strong> for detailed setup instructions.
        </p>
      </div>
    </div>
  </body>
</html>
    `

    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(htmlContent)
        iframeDoc.close()
      }
    }
  }, [])

  return (
    <div className="w-full h-screen">
      <iframe ref={iframeRef} className="w-full h-full border-0" title="Toyfront Ecommerce" />
    </div>
  )
}
