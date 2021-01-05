# Docker

## Primeiro exemplo

Vamos começar criando a imagem da aplicação de exemplo. Não é necessário entender neste momento, será explicado mais adiante. 
abra o terminal na mesma pasta do arquivo **dockerfile** rode o comando
```bash
docker image build -t juridico:1.0 .
```
Com a imagem criada vamos executar o comando que irá iniciar o container

```bash
docker container run --name juridico-example juridico:1.0
```
A mensagem `Server running on port 3000` deve estar sendo exibida na tela.
Antes de prosseguir vamos a uma breve explicação
- docker: invoca a cli do docker
- container: sobre qual componente do docker vamos efetuar o comando
- run: cria e roda um novo container baseado na imagem informada em seguida
- juridico:1.0: nome da imagem **:** versão da imagem
- --name `container-name`: define qual vai ser o nome do container (juridico-example neste caso). Se este valo não for informado, o docker cria um aleatório

Por tratar-se de uma aplicação web, podemos acessar pelo navegador pelo endereço: [http://localhost:3000](http://localhost:3000)
Não funcionou mesmo com o container rodando :'(
Para verificar se o container esta rodando abra uma nova janela de comando (essa pode ser em qualquer pasta) e roda o comando que lista os containers que estão rodando.

```bash
docker container ps
```
> para listar todos os containers independente do seu estado basta adicionar a opção -a.

Como foi mencionado na introdução deste repositório, os containers possuem todos os seus recursos alocados segregados do resto do sistema por questões de segurança. No entanto, o processo pai (onde está rodando o docker) consegue acessar os recursos do container, já que este é um processo filho do sistema base. Para que seja possível acessar a aplicação web fora do ambiente do container é necessário realizar um mapeamento entre a porta do container com uma porta do SO base.

Para isso pare a execução do container (CTRL + C) e em seguida rode o comando abaixo

```bash
docker container stop juridico-example
```
Explicando os comandos novos:
- stop: para a execução dos containers informados. Podem ser utilizados nomes ou os id's dos containers, separados por espaço
- juridico-example: nome do container que deve ser parado

```bash
docker container run -p 8010:3000 juridico:1.0
```
Explicando:
- -p 8010:3000: Mapeia todo o tráfego da porta 8010 da máquina base para a porta 3000 do container.

> Dúvida: O que acontece se tentarmos rodar um novo container com o mesmo nome de um container existente, mesmo que este esteja parado?
```bash
docker container run -p 8010:3000 --name  juridico-example juridico:1.0
```
Rodando o comando anterior deve ter aparecido a seguinte mensagem: 
> 'docker: Error response from daemon: Conflict. The container name "/juridico-example" is already in use by container "`container-id`"

Isso acontece porque o docker utiliza tanto o id quanto o nome como identificadores únicos para os containers

## Criando uma imagem
Quando se trabalha com containers dificilmente não teremos de construir uma imagem da aplicação. Basicamente uma imagem é um template contendo um conjunto de instruções que irão criar um container que será executado no docker. Toda a imagem é do tipo read-only após criada.
Isso significa que não posso alterar nada na imagem? Exato. Uma imagem pode servir de base para outras, porém o seu valor não irá mudar, a menos que uma nova imagem substitua aquela.
No entanto, existe uma forma de realizar algumas alterações no container que está rodando. Estas alterações durarão somente o tempo em que o container estiver no ar.

Existem duas formas de criarmos uma imagem, pelo modo interativo e por dockerfile. Aqui será abordado somente o dockerfile. Caso deseje saber como funciona o modo interativo, basta acessar a [documentação do docker](https://docs.docker.com/engine/reference/commandline/commit/) ou (ler esse artigo)[https://jfrog.com/knowledge-base/a-beginners-guide-to-understanding-and-building-docker-images/] que explica de forma mais aprofundada o que é uma imagem e ensina a usar o modo interativo.

### Dockerfile
O dockerfile é um arquivo onde estão as instruções de como a imagem deve ser montada.

Exemplo do dockerfile básico utilizado neste roteiro
```dockerfile
FROM alpine

RUN apk add bash

RUN apk add curl

RUN apk add  --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.9/main/ nodejs=12.18.4-r0

RUN apk add npm

WORKDIR /app

COPY app .

RUN npm install

CMD [ "node", "server.js" ]
```

Vamos entnder o que cada comando faz
- **FROM**: imagem base a qual a nova imagem será derivada. 
- alpine: Nome da imagem base. A notação utilizada é **imagem:tag**, porém, se a tag for omitida o docker irá buscar a tag _latest_ por padrão
    - Existe uma forma de se criar uma imagem a partir do zero, porém é pouco usado no dia-a-dia e não será abordada aqui
- **RUN**: executa uma instrução shell. No exemplo temos instalação de softwares e um comando para restaurar pacotes npm
- **WORKDIR**: informa em qual diretório os comandos devem ser executados. Quando acessamos por modo interativo também é o diretório inicial do container
- **COPY**: executa o comando de cópia entre a máquina base e a imagem. No exemplo o arquivo está copiando todos os arquivos da pasta app para a pasta raiz

para criar a imagem basta rodar a instrução abaixo:

```bash
docker image build -t juridico:1.0 .
```

Explicando:
- docker: invoca a cli do docker
- image: sobre qual componente do docker vamos efetuar o comando
- build: criar uma nova imagem
- -t: informa que vamos taggear a imagem
- juridico:1.0: nome da imagem:tag
- *.* : O contexto onde a imagem vai ser criada. É a partir deste contexto que os comandos de comunicação entre a imagem e a máquina local vão rodar

### .dockerignore
Este arquivo serve para evitar que determinados arquivos ou padrões de arquivos sejam transferidos para dentro da imagem, ocasionando vazamento de informações sigilosas ou até mesmo ocasionando erros dentro do container por estar compilado para uma plataforma diferente da do container.

> Se você está criando a imagem numa máquina com Windows, experimente montar a imagem sem ignorar a cópia da pasta node_modules e veja o erro que aparece. Isso ocorre porque a biblioteca copiada para dentro do node_modules esta compilada para o Windows e o comando `npm install` não a substitui

### Layers e seu impacto no tamanho das imagens
Um ponto imporante a ressaltar é que cada comando executado no dockerfile gera um layer. Lembra a imagem é read-only. A ideia por trás desses layers é termos uma imagem modular e valer-se de cache o máximo possível. No entanto, cada layer adiciona alguns Kb extras para o tamanho da imagem. 

Vamos fazer um execício, execute o comando abaixo para gerar uma nova imagem com o arquivo dockerfile.groupcommands
```bash
    docker image build -t juridico:multi-stage -f ./dockerfile.groupcommands .
```
Explicando a opção nova
- -f: informa que vamos usar um nome ou caminho diferente para o dockerfile
- ./dockerfile.groupcommands: o caminho com o nome do dockerfile desejado

após o término do build execute o comando abaixo e veja a diferença do tamanho da imagem 
```bash
    docker image ls
```
- ls: lista todas as imagens disponíveis

Indo ainda mais longe, podemos verificar a quantidade de camadas geradas por cada dockerfile rodando o comando abaixo para cada imagem
```bash
    docker image history <image-name>:<tag>
```