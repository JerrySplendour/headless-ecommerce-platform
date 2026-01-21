export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application settings</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">API Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
            <input
              type="text"
              className="input"
              readOnly
              value={import.meta.env.VITE_API_BASE_URL || "Not configured"}
            />
            <p className="text-sm text-gray-500 mt-1">Configure this in your .env file</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">About</h2>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-semibold">Application:</span> Toyfront Ecommerce Platform
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Version:</span> 1.0.0
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Backend:</span> WordPress + WooCommerce
          </p>
        </div>
      </div>
    </div>
  )
}
