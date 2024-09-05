export function getMyBagData(username) {
    let myBagUserData = require('./data/MyBagData.json');

    let myBagData = '';
    if(username){
        myBagData = myBagUserData[`${username}`];
    }
    return myBagData;
}

// function test(){
//     getUser().then((data) => console.log(data));
// }