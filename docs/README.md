# Documentação - Persevera Forms

Esta pasta contém documentação adicional sobre os formulários da Persevera Investimentos.

## Configuração do GitHub Pages

O projeto está configurado para ser hospedado diretamente através do GitHub Pages, utilizando a branch principal (`main`) como fonte.

## Uso dos Formulários

### Formulário de Cadastro

O formulário de cadastro (ficha-cadastral.html) contém os seguintes campos:

1. **Dados Pessoais**
   - Nome Completo
   - Sexo
   - Estado Civil
   - CPF
   - Nacionalidade
   - Naturalidade
   - Data de Nascimento
   - Documentos de identificação

2. **Contato**
   - CEP
   - Endereço completo
   - Telefone
   - E-mail

3. **Envio de Documentos**
   - Documento de Identidade
   - Comprovante de Residência

4. **Conformidade e Termos**
   - Declarações sobre Pessoa Politicamente Exposta
   - Origem dos recursos
   - Declarações e termos de aceite

## Fluxo de Envio

1. O usuário preenche os dados no formulário
2. Ao finalizar, clica em "Enviar"
3. Os dados são validados pelo script no lado do cliente
4. Se válidos, são enviados para processamento
5. O usuário é redirecionado para a página de agradecimento

## Manutenção

Para atualização dos formulários:

1. Faça as alterações necessárias nos arquivos HTML
2. Teste os formulários localmente
3. Faça commit das alterações para o repositório
4. O GitHub Pages atualizará automaticamente o site

## Validações implementadas

- CPF: formato e dígitos verificadores
- E-mail: formato válido
- CEP: consulta à API ViaCEP
- Telefone: formato conforme o país selecionado
- Datas: formato e validação
- Idade: mínimo de 18 anos

## API de Integração

O formulário está configurado para usar JotForm como processador de envio. 