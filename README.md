# Save Point v3

Biblioteca web de referências para trilhas sonoras, com mini player para links diretos autorizados, página individual de detalhes, filtros, importação/exportação JSON e alternância de tema. YouTube e Spotify são tratados apenas como links para a plataforma original: o app não extrai, baixa ou contorna proteção de conteúdo desses serviços.

## Executar com o backend local

Requer Node.js 20 ou mais recente. Na pasta do projeto:

```sh
npm start
```

Abra http://127.0.0.1:3000. O servidor usa `data/tracks.json` para persistir o catálogo e escuta apenas em `127.0.0.1`. **Não exponha este servidor publicamente**: a API de gravação é para uso local e não possui autenticação.

## Executar como site estático

Hospede `index.html`, `track.html`, `details.js`, `theme.js`, `styles.css` e `app.js` em qualquer servidor estático. Sem `/api/tracks`, o app salva no `localStorage` do navegador. Os detalhes e a biblioteca são lidos do navegador que adicionou as faixas.

## Funcionalidades

- Player fixo no rodapé para URLs diretas de áudio que permitam reprodução.
- Página `track.html?id=...` com metadados, reprodução e link à fonte original.
- Links do YouTube/Spotify abrem os serviços originais; não há extração de áudio.
- Busca, filtro por gênero e ordenação.
- Tema claro/escuro persistido no navegador.
- Catálogo JSON no backend local, com fallback para armazenamento do navegador.

Compartilhe apenas links e conteúdo que você tenha autorização para usar. A reprodução depende dos termos, permissões e disponibilidade da fonte externa.
