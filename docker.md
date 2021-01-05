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
