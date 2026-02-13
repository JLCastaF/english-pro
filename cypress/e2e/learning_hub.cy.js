describe('Learning Hub - Verificación de Módulos y Progreso', () => {
  
  beforeEach(() => {
    // 1. Simular Login (O usar sesión si ya la tienes configurada)
    cy.visit('/login');
    cy.get('[data-test="email-input"]').type('genius.ice@gmail.com');
    cy.get('[data-test="password-input"]').type('jorge123');
    cy.get('[data-test="auth-submit"]').click();
    
    // 2. Navegar al Hub
    cy.url().should('include', '/dashboard');
    cy.visit('/study'); // O la ruta que tengas para el Hub
  });

  it('Debería cargar y mostrar la lista de temas disponibles', () => {
    // Verifica que existan tarjetas de temas
    cy.get('[data-test="topic-card"]').should('have.length.at.least', 1);
    
    // Verifica que los títulos no estén vacíos
    cy.get('[data-test="topic-title"]').first().should('not.be.empty');
  });

  it('Debería filtrar temas correctamente mediante el buscador', () => {
    // Escribimos un tema que sepamos que existe, ej: "Present"
    cy.get('[data-test="search-input"]').type('Present');
    
    // Todas las tarjetas visibles deberían contener la palabra "Present"
    cy.get('[data-test="topic-card"]').each(($el) => {
      cy.wrap($el).find('[data-test="topic-title"]').should('contain.text', 'Present');
    });
  });

  it('Debería navegar a la pantalla de ejercicio al hacer clic en Practicar', () => {
    // Hacemos clic en el primer botón de práctica
    cy.get('[data-test="practice-button"]').first().click();
    
    // Verificamos que la URL cambie a la estructura de ejercicios
    cy.url().should('include', '/exercise/');
  });

  it('Debería mostrar visualmente los temas ya completados', () => {
    // Esta prueba asume que el usuario ya tiene al menos un tema dominado en Firebase
    // Buscamos si existe el badge de "Dominado"
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="mastered-badge"]').length > 0) {
        cy.get('[data-test="mastered-badge"]').first().should('be.visible');
        cy.get('[data-test="mastered-badge"]').first().should('contain.text', 'DOMINADO');
      } else {
        cy.log('El usuario aún no tiene temas dominados para testear este badge.');
      }
    });
  });
});