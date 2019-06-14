function typeWriter(elemento){
    const textoArray = elemento.innerHTML.split('');
    elemento.innerHTML = '';
    textoArray.forEach((letra, i) => {
        setTimeout(() => elemento.innerHTML += letra, 75 * i);
    });

}
const tiulo = document.querySelector('h1');
typeWriter(tiulo);

typeWriter(document.querySelector('p'));