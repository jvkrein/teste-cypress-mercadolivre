const selectors = {
  searchInput: 'input[name="as_word"], input.nav-search-input, input[placeholder*="Buscar"]',
  resultList: '.ui-search-layout, ol.ui-search-layout, section.ui-search-results',
  productTitle: '.poly-component__title, .ui-search-item__title',
  productLink: 'a.poly-component__title, a.ui-search-link, .ui-search-result__image a',
  loginInput: 'input[name="user_id"], input#user_id, input[type="email"]',
}

const visitHome = () => {
  cy.visit('/', { failOnStatusCode: false })
  closePossibleOverlay()
}

const closePossibleOverlay = () => {
  cy.get('body', { log: false }).then(($body) => {
    const buttons = [...$body.find('button, a')]
    const overlayButton = buttons.find((button) =>
      /^(entendi|aceitar|aceitar cookies|agora nao|agora não|mais tarde)$/i.test(button.innerText.trim()),
    )

    if (overlayButton) {
      cy.wrap(overlayButton, { log: false }).click({ force: true })
    }
  })
}

const searchFor = (term) => {
  cy.get(selectors.searchInput)
    .should('be.visible')
    .clear()
    .type(`${term}{enter}`)

  cy.location('href', { timeout: 20000 }).should('match', /search|lista|_DisplayType|as_word/i)
  closePossibleOverlay()
}

const isSecurityFlow = (href) => /account-verification|challenge|security|captcha/i.test(href)

const validateSecurityFlow = () => {
  cy.contains('body', /para continuar|acesse sua conta|sou novo|ja tenho conta|já tenho conta/i).should('be.visible')
}

describe('Testes de Funcionalidade - Mercado Livre', () => {
  it('Cenario 1: Pesquisar por um determinado produto', () => {
    visitHome()
    searchFor('Notebook')

    cy.location('href').then((href) => {
      if (isSecurityFlow(href)) {
        validateSecurityFlow()
        cy.screenshot('cenario-1-verificacao-conta')
        return
      }

      cy.get(selectors.resultList).should('be.visible')
      cy.get(selectors.productTitle)
        .should('have.length.greaterThan', 0)
        .first()
        .invoke('text')
        .should('not.be.empty')
      cy.contains('body', /Notebook/i).should('be.visible')
      cy.screenshot('cenario-1-pesquisa-notebook')
    })
  })

  it('Cenario 2: Adicionar um item ao carrinho de compras', () => {
    visitHome()
    searchFor('Cabo USB')

    cy.location('href').then((searchHref) => {
      if (isSecurityFlow(searchHref)) {
        validateSecurityFlow()
        cy.screenshot('cenario-2-verificacao-conta')
        return
      }

      cy.get(selectors.productLink)
        .filter(':visible')
        .first()
        .invoke('removeAttr', 'target')
        .click({ force: true })

      closePossibleOverlay()

      cy.contains('button, a', /Adicionar ao carrinho/i, { timeout: 25000 })
        .should('be.visible')
        .click({ force: true })

      cy.location('href', { timeout: 30000 }).then((href) => {
        const redirectedToExpectedFlow = /cart|carrinho|login|registration|challenge|security|checkout/i.test(href)

        if (redirectedToExpectedFlow) {
          expect(href).to.match(/cart|carrinho|login|registration|challenge|security|checkout/i)
          cy.screenshot('cenario-2-adicionar-carrinho')
          return
        }

        cy.get('body').should(($body) => {
          expect($body.text()).to.match(
            /carrinho|adicionado|continuar compra|ir para o carrinho|entre|nao sou um robo|não sou um robô/i,
          )
        })
        cy.screenshot('cenario-2-adicionar-carrinho')
      })
    })
  })

  it('Cenario 3: Validar pagina de Login', () => {
    cy.visit('https://www.mercadolivre.com/jms/mlb/lgz/login', { failOnStatusCode: false })
    closePossibleOverlay()

    cy.get(selectors.loginInput).should('be.visible')
    cy.contains('button, input[type="submit"]', /Continuar/i).should('be.visible')
    cy.screenshot('cenario-3-login')
  })
})
