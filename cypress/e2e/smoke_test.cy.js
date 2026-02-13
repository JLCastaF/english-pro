describe('English Pro - Master Smoke Test', () => {
  // 1. Configuramos el acceso antes de cada test
  beforeEach(() => {
    cy.visit('/');
    const email = Cypress.env('TEST_USER_EMAIL');
    const pw = Cypress.env('TEST_USER_PW');

    // Login automático usando nuestros nuevos data-test
    cy.get('[data-test="email-input"]').type(email);
    cy.get('[data-test="password-input"]').type(pw);
    cy.get('[data-test="auth-submit"]').click();

    // Verificamos que entramos al dashboard
    cy.url().should('include', '/dashboard');
  });

  it('Debería completar un flujo completo de ejercicio con éxito', () => {
    // 1. Ir a la sección de estudio
    cy.contains('Bienvenido', { timeout: 10000 }).should('be.visible');

    // 2. Ahora buscamos el botón. Usamos una búsqueda más flexible por si hay espacios o caracteres raros
    cy.get('button, a')
      .contains(/Comenzar a aprender/i, { timeout: 7000 })
      .should('be.visible')
      .click();

    // 3. Verificar que entramos al Hub
    cy.url().should('include', '/study');
    
    // 2. Seleccionar el primer tema disponible (ajusta el selector si es necesario)
    cy.get('button').contains('Practicar').first().click();

    // 3. Resolver el ciclo de preguntas (English Pro hace 5 por sesión)
    for(let i = 0; i < 5; i++) {
      cy.get('[data-test="question-text"]').should('be.visible');
      
      // Aquí viene el truco de QA: Escribimos algo para probar el botón
      cy.get('[data-test="exercise-input"]').type('Testing');
      cy.get('[data-test="exercise-action-button"]').click();
      
      // No importa si fallamos o acertamos, lo importante es que el flujo avance
      cy.get('[data-test="exercise-action-button"]').click(); 
    }

    // 4. Verificar que llegamos a la pantalla de resultados
    cy.get('[data-test="result-card"]').should('be.visible');
    cy.get('[data-test="final-score"]').should('exist');
    
    // 5. Volver al Hub y verificar persistencia
    cy.get('[data-test="finish-button"]').click();
    cy.url().should('include', '/study');
  });

  it('Debería validar la seguridad de la Wiki (Admin Check)', () => {
    // Intentar entrar forzadamente a la wiki
    cy.visit('/wiki-editor');
    
    // El sistema debería protegernos (puedes ajustar a qué URL debería redirigir)
    cy.url().should('not.include', '/wiki-editor');
  });
});