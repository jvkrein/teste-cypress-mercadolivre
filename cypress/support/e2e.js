// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Sites de terceiros podem disparar erros de scripts que nao fazem parte
// do fluxo validado. Mantemos o teste focado nos elementos da interface.
Cypress.on('uncaught:exception', () => false)
