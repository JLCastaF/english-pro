describe('English Pro - Demo (Login, Seguridad, E2E, Admin)', () => {

beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Opcional si usas sessionStorage moderno:
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

    it('PANTALLA DE LOGIN (Credenciales inválidas y acceso no autorizado)', () => {
        
    cy.visit('/');
    cy.get('[data-test="auth-title"]').should('contain', 'English Pro');
    cy.get('[data-test="email-input"]').type('usuario.invalido@test.com');
    cy.get('[data-test="password-input"]').type('ClaveIncorrecta123!', { log: false });
    cy.get('[data-test="auth-submit"]').click();

    cy.url().should('not.include', '/dashboard');
    cy.get('[data-test="auth-title"]').should('contain', 'English Pro');
    
    });

    it(' Login Correcto Credenciales seguras desde .env y Validación de carga y navegación Pantallas Clave', () => {
    cy.visit('/');
    cy.get('[data-test="email-input"]').clear().type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('[data-test="password-input"]').clear().type(Cypress.env('TEST_USER_PW'), { log: false });
    cy.get('[data-test="auth-submit"]').click();

    // 1. PANTALLA LEARNING HUB (Validación del buscador)
    cy.url().should('include', '/dashboard');
    cy.contains('Bienvenido', { timeout: 10000 }).should('be.visible');
    cy.contains(/Comenzar a aprender/i).click();

    // 2. PANTALLA LEARNING HUB (Validación del buscador)
    cy.url().should('include', '/study');
    cy.get('[data-test="search-input"]').should('be.visible').type('Present');
    
    // 3.Validamos que el filtro responde y entramos al tema filtrado
    cy.get('[data-test="practice-button"]').contains('Practicar').first().click();

    // 4. Resolver ciclo de preguntas (English Pro hace 5 por sesión)

    for(let i = 0; i < 5; i++) {
      cy.get('[data-test="question-text"]').should('be.visible');
      
      cy.get('[data-test="exercise-input"]').type('Testing');
      cy.get('[data-test="exercise-action-button"]').click();
      
      // No importa si fallamos o acertamos, lo importante es que el flujo avance
      cy.get('[data-test="exercise-action-button"]').click(); 
    }

    // 5. Verificar pantalla de resultados
    cy.get('[data-test="result-card"]').should('be.visible');
    cy.get('[data-test="final-score"]').should('exist');
    cy.get('[data-test="finish-button"]',{ timeout: 10000 }).click();

    // 6. Volver al Hub    
    cy.url().should('include', '/study');
    cy.contains('Panel Principal').click({ force: true });

    // 7. PANTALLA Admin
    cy.contains('Panel Administrativo').should('be.visible');
    cy.contains('VER USUARIOS').click({ force: true });
    cy.url().should('include', '/admin-users');
    
    cy.contains(' Volver al Panel', { timeout: 10000 }).click({ force: true });

    cy.url().should('include', '/dashboard');
    cy.contains('Salir').click({ force: true });

      });

    it('Validacion Perfil de Usuario Not Admin', () => {

    cy.visit('/');

    cy.get('[data-test="email-input"]').clear().type(Cypress.env('TEST_USER_EMAIL_NOT_ADMIN'));
    cy.get('[data-test="password-input"]').clear().type(Cypress.env('TEST_USER_PW_NOT_ADMIN'), { log: false });
    cy.get('[data-test="auth-submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('body').should('not.contain', 'Panel Administrativo');
    cy.contains('Salir', { timeout: 10000 }).click({ force: true });

 });

   it('Cambio',() => {

    cy.visit('/');
    
    cy.get('[data-test="auth-submit"]')
    .should('be.visible')
    .and('contain.text', 'Iniciar Sesión');
  
   // cy.contains('Iniciar Sesión').should('be.visible');
 });

});