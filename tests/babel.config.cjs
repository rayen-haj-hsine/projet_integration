module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      },
      modules: 'commonjs' // Transform ES modules to CommonJS for Jest compatibility
    }],
    ['@babel/preset-react', {
      runtime: 'automatic' // Use the new JSX transform (no need to import React)
    }],
    ['@babel/preset-typescript', {
      jsx: 'react-jsx' // Use the new JSX transform for TypeScript
    }]
  ]
};

