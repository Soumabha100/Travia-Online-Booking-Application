const Input = document.getElementById("my-input");
const Submit = document.getElementById("mySubmit");
const p1 = document.getElementById("p1");
const p2 = document.getElementById("p2");


let inputAmount ;
let tax ;
let finalAmoount ;

Submit.onclick = function () {
    inputAmount = Number(Input.value) ;

    console.log(inputAmount);

    if(inputAmount > 0){
        p1.textContent = `Your total income is :₹${inputAmount}`;
    }
    else {
        p1.textContent = `Your income cannot be negative! `;
    }

    if (inputAmount < 300000){
        tax = 0;
    }
    else if (inputAmount >= 300000 && inputAmount < 700000) {
        tax = (5/100) * inputAmount;
    }
    else if (inputAmount >= 700000 && inputAmount < 1000000){
        tax = (10/100) * inputAmount;
    }
    else if (inputAmount >= 1000000 && inputAmount < 1200000){
        tax = (15/100) * inputAmount;
    }
    else if (inputAmount >= 1200000 && inputAmount < 1500000){
        tax = (20/100) * inputAmount;
    } else {
        tax = (30/100) * inputAmount;
    }

    console.log(tax);

     p2.textContent = `Your total tax is :₹${tax}`;






}