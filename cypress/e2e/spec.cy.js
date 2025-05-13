describe('StrongIron - Login de Usuário', () => {
  before(() => {
    // Configura uma sessão para manter o estado de login
    cy.session('loggedInUser', () => {
      cy.visit('/login.html');
      cy.wait(2000); // Pausa de 2 segundos para carregar a página
      cy.get('#email', { timeout: 10000 }).should('be.visible').type('test@test.com', { delay: 100 });
      cy.wait(1000); // Pausa de 1 segundo
      cy.get('#password').type('test', { delay: 100 });
      cy.wait(1000); // Pausa de 1 segundo
      cy.get('button[type="submit"]').click();
      cy.wait(3000); // Pausa de 3 segundos para aguardar o redirecionamento
      cy.url().should('include', '/dashboard.html', { timeout: 10000 });
    });
  });

  it('realiza o login com sucesso', () => {
    cy.visit('/dashboard.html');
    cy.wait(2000); // Pausa de 2 segundos para carregar a página
    cy.get('#logout-button').should('be.visible'); // Verifica se o botão de logout aparece
  });
});