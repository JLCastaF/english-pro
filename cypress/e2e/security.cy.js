describe('Security Checks', () => {
  it('Debería proteger la Wiki de usuarios no autorizados', () => {
    // Intentamos entrar directo a la URL de edición
    cy.visit('/wiki-editor');
    
    // Verificamos que el sistema nos saque de ahí (redirección al Home o Study)
    cy.url().should('not.include', '/wiki-editor');
    cy.url().should('match', /\/|study/);
  });
});