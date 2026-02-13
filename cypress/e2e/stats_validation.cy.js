describe('Validación de Estadísticas Reales', () => {
  beforeEach(() => {
    cy.visit('/login');
    // Usamos tus credenciales reales
    cy.get('input[type="email"]').type('genius.ice@gmail.com');
    cy.get('input[type="password"]').type('jorge123'); 
    cy.get('button[type="submit"]').click();
    
    // Esperamos a que el Dashboard cargue los datos de Firebase
    cy.url().should('include', '/dashboard', { timeout: 15000 });
    cy.contains('Cargando Datos...', { timeout: 15000 }).should('not.exist');
  });

  it('Debería mostrar la Racha Nube de 5 aciertos', () => {
    // Validamos que el contenedor de racha sea visible
    cy.contains('span', 'Racha Nube').should('be.visible');
    
    // Verificamos el valor exacto que vimos en tu base de datos (5)
    cy.get('span.text-orange-700')
      .should('be.visible')
      .and('contain.text', '5 aciertos'); 
  });

  it('Debería mostrar el porcentaje de progreso', () => {
    // Buscamos el porcentaje en el color ámbar que definiste
    cy.get('span.text-amber-600')
      .should('be.visible')
      .invoke('text')
      .should('match', /\d+%/); 
  });

  it('Debería tener la barra de progreso con el ancho correcto', () => {
    // Verificamos que la barra naranja exista y tenga un estilo de ancho
    cy.get('.bg-amber-500')
      .should('have.attr', 'style')
      .and('include', 'width');
  });
});