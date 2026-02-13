describe('Pruebas de Módulos - English Pro', () => {
  beforeEach(() => {
    // Login rápido para llegar a Topics
    cy.visit('/login');
    cy.get('input[type="email"]').type('genius.ice@gmail.com');
    cy.get('input[type="password"]').type('jorge123'); // Pon tu clave real
    cy.get('button[type="submit"]').click();
    
    // Navegamos a Topics
    cy.contains('button', 'Ir a las lecciones', { timeout: 10000 }).click();
    
    // ESPERA CRÍTICA: Esperamos a que el loader de módulos desaparezca
    cy.contains('Cargando Módulos...', { timeout: 15000 }).should('not.exist');
  });

  it('Debería mostrar el encabezado y progreso correctamente', () => {
    // Verificar título de la sección
    cy.get('h2').should('contain.text', 'Tiempos Verbales');
    
    // Verificar que el footer muestra el progreso (ej. "1 de 12 listos")
    cy.get('footer').within(() => {
      cy.contains('Tu Progreso Real').should('be.visible');
      cy.get('span.text-indigo-400').should('not.be.empty'); // El número de completados
    });
  });

  it('Debería detectar temas completados vs pendientes', () => {
    // Si sabemos que Present Simple está completado (según tu Firebase anterior)
    // Buscamos el texto exacto que pones en tu lógica condicional
    cy.get('.grid').then(($grid) => {
      if ($grid.text().includes('Completado')) {
        cy.contains('span', 'Completado').should('be.visible');
      } else {
        cy.contains('span', '10 Ejercicios listos').should('be.visible');
      }
    });
  });

  it('Debería poder regresar al Dashboard mediante el BackButton', () => {
    // Tu código: <BackButton to="/dashboard" text="Volver al Dashboard" />
    cy.contains('Volver al Dashboard').click();
    cy.url().should('include', '/dashboard');
  });

  it('Debería entrar a un ejercicio al hacer clic en un tema', () => {
    // Hacemos clic en el primer tema de la lista
    cy.get('.grid > div').first().click();
    
    // Verificamos que la URL cambie al formato: /exercise/[id]
    cy.url().should('include', '/exercise/');
  });
});