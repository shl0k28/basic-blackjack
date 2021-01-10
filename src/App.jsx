import React from 'react'
import axios from 'axios'

const api_url = 'https://deckofcardsapi.com/api'

const App = () => {

    const [deckId,setDeckId] = React.useState()
    const [playerDeck, setPlayerDeck] = React.useState([])
    const [dealerDeck, setDealerDeck] = React.useState([])
    const [gameOver, setGameOver] = React.useState(false)
    const [winner,setWinner] = React.useState()

    React.useEffect(() => {
        let deck_id = localStorage.getItem('deck_id')
        let player_deck = JSON.parse(localStorage.getItem('player_deck'))
        let dealer_deck = JSON.parse(localStorage.getItem('dealer_deck'))
        if(deck_id){
            setDeckId(deck_id)
        }
        if(player_deck){
            setPlayerDeck(player_deck)
        }
        if(dealer_deck){
            setDealerDeck(dealer_deck)
        }
    },[])

    React.useEffect(() => {
        localStorage.setItem('deck_id', deckId)
        localStorage.setItem('player_deck', JSON.stringify(playerDeck))
        localStorage.setItem('dealer_deck', JSON.stringify(dealerDeck))
    },[deckId, playerDeck, dealerDeck])

    React.useEffect(() => {
        const gameResult = async () => {
            const playerDeckVal = await playerDeckValue()
            const dealerDeckVal = await dealerDeckValue()
            if(playerDeckVal > 21 || dealerDeckValue === 21){
                console.log("Dealer Wins");
                setGameOver(true)
                setWinner("Dealer")
            }
            if(playerDeckVal === 21 || (dealerDeckValue > 21 && playerDeckVal < 21)){
                console.log("Player Wins")
                setGameOver(true)
                setWinner("Player")
            }
            if(playerDeckVal === 21 && dealerDeckVal === 21){
                console.log("Push")
                setGameOver(true)
            }
            // if(playerDeckValue > dealerDeckValue && (playerDeckValue > 10 && dealerDeckValue > 10)){
            //     console.log("Player Wins");
            //     setGameOver(true)
            //     setWinner("Player")
            // }
            // else {
            //     console.log("Dealer Wins")
            //     setGameOver(true)
            //     setWinner("Dealer")
            // }
        }
        gameResult()
    })

    //start a new game
    const dealGame = async () => {
        let response = await axios.get(`${api_url}/deck/new/shuffle/?deck_count=6`);
        console.log(response.data);
        let deck_id = await response.data.deck_id;
        setDeckId(deck_id);
        let player_deck = [];
        let dealer_deck = [];
        let drawn_cards = await axios.get(`${api_url}/deck/${deck_id}/draw/?count=3`);
        player_deck.push(drawn_cards.data.cards[0]);
        player_deck.push(drawn_cards.data.cards[1]);
        dealer_deck.push(drawn_cards.data.cards[2]);
        setDealerDeck(dealer_deck)
        setPlayerDeck(player_deck) 
    }

    //revert back
    const resetGame = () => {
        localStorage.clear()
        setGameOver(false)
        setWinner("")
        setDealerDeck([])
        setPlayerDeck([])
        setDeckId()
    }

    //player hits 
    const playerHit = async () => {
        if(playerDeck.length < 5){
            const response = await axios.get(`${api_url}/deck/${deckId}/draw/?count=1`)
            const card_data = await response.data.cards[0]
            console.log(card_data)
            setPlayerDeck((playerDeck) => [...playerDeck, card_data]);
        }
        else {
            console.log(`Max deck length`);
        }
    }

    //player stands
    const playerStands = async () => {
        let cardsForDealer = playerDeck.length
        console.log(cardsForDealer)
        const response = await axios.get(`${api_url}/deck/${deckId}/draw/?count=${cardsForDealer}`)
        for(let i = 0; i < cardsForDealer - 1 ; i++) {
            let dealer_card = await response.data.cards[i];
            setDealerDeck((dealerDeck) => [...dealerDeck,dealer_card])
        }
    }

    //check the value of player deck after each hit.
    const playerDeckValue = async () => {
        let cardSum = 0;
        playerDeck.forEach(card => {
            let val = getCardVal(card)
            cardSum = cardSum + val
        })
        console.log("Player Deck Value: ", cardSum)
        return cardSum
    }

    const dealerDeckValue = async () => {
        let cardSum = 0;
        dealerDeck.forEach(card => {
            let val = getCardVal(card)
            cardSum = cardSum + val
        })
        console.log("Dealer Deck Val: ", cardSum)
        return cardSum
    }

    //convert the card value from string to int.
    const getCardVal = card => {
        let card_val = card.value
        console.log(card_val)
        if(
            card_val === 'KING' ||
            card_val === 'QUEEN' ||
            card_val === 'JACK'
        ){
            card_val = 10
        }
        else if(card_val === 'ACE'){
            card_val = 11
        }
        else {
            card_val = parseInt(card_val)
        }
        return card_val
    }

    const GameOver = ({isGameOver}) => {
        if(isGameOver === true){
            return(
                <div className="flex items-center justify-center">
                    <p className="text-5xl font-bold">{winner} wins</p>
                </div>
            )
        }
        else{
            return(<></>)
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-center mt-6">MLH Hack Day - Basic BlackJack</h1>
            <br/>
            <div className="flex justify-center items-center">
                <button 
                    onClick={dealGame} 
                    className="border-2 px-3 py-1 text-md font-semibold rounded-lg border-gray-900">
                        Deal
                </button>
                <button 
                    onClick={playerHit}
                    className="border-2 px-3 py-1 text-md font-semibold rounded-lg border-gray-900 ml-4"
                >
                        Hit Me
                </button>
                <button onClick={playerStands} className="border-2 px-3 py-1 text-md font-semibold rounded-lg border-gray-900 ml-4">Stand</button>
                <button onClick={resetGame} className="border-2 px-3 py-1 text-md font-semibold rounded-lg border-gray-900 ml-4">Reset Game</button>
            </div>
            <div className="mt-3">
                <GameOver isGameOver={gameOver} className="mt-4"/>
            </div>
            <br/><br/>
            <div className="flex justify-center items-center">
                <h2 className="text-xl font-bold">Dealer: </h2>
                <div className="flex m-4">
                    {
                        dealerDeck.map(card => {
                            return(
                                <div key={card.code}>
                                    <img src={card.image} alt={card.value} className="h-64 w-48"/>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <br/>
            <div className="flex justify-center items-center">
                <h2 className="text-xl font-bold">Player: </h2>
                <div className="flex m-4">
                    {
                        playerDeck.map(card => {
                            return(
                                <div key={card.code}>
                                    <img src={card.image} alt={card.value} className="h-64 w-48 ml-4"/>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <br/>   
        </div>
    )
}

export default App
