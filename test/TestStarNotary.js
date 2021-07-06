const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();

    await instance.createStar('Awesome Star!', 'AS', tokenId, {from: accounts[0]});

    const star = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(star.name, 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");

    await instance.createStar('awesome star', 'as', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('awesome star', 'as', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});

    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);

    await instance.buyStar(starId, {from: user2, value: balance});

    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);

    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('awesome star', 'as', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});

    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);

    await instance.buyStar(starId, {from: user2, value: balance});

    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('awesome star', 'as', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});

    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);

    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});

    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);

    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);

    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 6;
    const starName = "super star";
    const starSymbol = "SS";

    // 1. create a Star with different tokenId
    await instance.createStar(starName, starSymbol, starId, {from: user1});
    // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const currentStar = await instance.lookUptokenIdToStarInfo(starId, {from: user1});

    assert.equal(currentStar.name, starName);
    assert.equal(currentStar.symbol, starSymbol);
});

it('lets 2 users exchange stars', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 7;
    const starName = "super star 7";
    const starSymbol = "SS7";

    const user2 = accounts[2];
    const starId2 = 8;
    const starName2 = "super star 8";
    const starSymbol2 = "SS8";

    // 1. create 2 Stars with different tokenId
    await instance.createStar(starName, starSymbol, starId, {from: user1});
    await instance.createStar(starName2, starSymbol2, starId2, {from: user2});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId, starId2, {from: user1})
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf(starId, {from: user1}), user2);
    assert.equal(await instance.ownerOf(starId2, {from: user1}), user1);
});

it('lets a user transfer a star', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 9;
    const starName = "super star 9";
    const starSymbol = "SS9";

    const user2 = accounts[2];

    // 1. create a Star with different tokenId
    await instance.createStar(starName, starSymbol, starId, {from: user1});
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, starId, {from: user1});
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf(starId, {from: user1}), user2);
});

it('lookUptokenIdToStarInfo test', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 10;
    const starName = "super star 10";
    const starSymbol = "SS10";

    // 1. create a Star with different tokenId
    await instance.createStar(starName, starSymbol, starId, {from: user1});
    // 2. Call your method lookUptokenIdToStarInfo
    const currentStar = await instance.lookUptokenIdToStarInfo(starId, {from: user1});
    // 3. Verify if you Star name is the same
    assert.equal(currentStar.name, starName);
});