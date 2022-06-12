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
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, { from: user1 })
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance})
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    assert.isBelow(+balanceAfterUser2BuysStar, +balanceOfUser2BeforeTransaction)
    assert.equal(await instance.ownerOf(5), user2)
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async () => {
    const instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    const starId = 223;
    await instance.createStar('A twinkling in may', starId, {from: owner});
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.name.call(), "Rex Stars");
    assert.equal(await instance.symbol.call(), "RXS");
});

it('lets 2 users exchange stars', async () => {
    // 1. create 2 Stars with different tokenId
    const instance = await StarNotary.deployed();
    const starId1 = 1234;
    const starId2 = 4321;
    const account1 = accounts[1]
    await instance.createStar('A great star', starId1, {from: owner});
    await instance.createStar('A great star too', starId2, {from: account1});

    assert.equal(await instance.ownerOf(starId1), owner)  // starId1 belongs to owner
    assert.equal(await instance.ownerOf(starId2), account1) // starId2 belongs to account1
    // further inverse check
    assert.notEqual(await instance.ownerOf(starId1), account1)
    assert.notEqual(await instance.ownerOf(starId2), owner)
    
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId1, starId2, { from: owner })

    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf(starId1), account1)  // starId1 now belongs to account1
    assert.equal(await instance.ownerOf(starId2), owner) // starId2 now belongs to owner
    // further inverse check
    assert.notEqual(await instance.ownerOf(starId1), owner)
    assert.notEqual(await instance.ownerOf(starId2), account1)
});

it('lets a user transfer a star', async () => {
    const instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    const starId = 765;
    const receiver = accounts[1]
    await instance.createStar('A super star', starId, { from: owner });
    assert.equal(await instance.ownerOf(starId), owner) // starId belongs to owner
    // further inverse check
    assert.notEqual(await instance.ownerOf(starId), receiver) // starId does not belong to account1
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(receiver, starId, { from: owner })
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf(starId), receiver) // starId belongs to account1
    // further inverse check
    assert.notEqual(await instance.ownerOf(starId), owner) // starId does not belong to owner anymore
});

it('lookUpTokenIdToStarInfo test', async() => {
    const instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    const starId = 841;
    const nameOfStar = 'green rigel'
    await instance.createStar(nameOfStar, starId, { from: owner });
    // 2. Call your method lookUptokenIdToStarInfo
    const starName = await instance.lookUptokenIdToStarInfo.call(starId)
    // 3. Verify if you Star name is the same
    assert.equal(nameOfStar, starName);
});
