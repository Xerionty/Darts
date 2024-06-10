<script setup>
import {computed, ref} from 'vue'
import Player from './models/Player.js'
import Dart from "./models/Dart.js";
import ConfettiExplosion from "vue-confetti-explosion";
import { useSound } from '@vueuse/sound'


const startScore = 501;

const players = ref([])
const currentPlayer = ref(null)
const turnScores = ref([])
const hoveredBox = ref(null)
const gameStarted = ref(false)
const playerName = ref('')
const legCount = ref(1)
const finishedGame = ref(false)

let sounds = [];
for(let i = 0; i <= 180; i++) {
  sounds[i] = useSound('./media/' + i + '.wav',
      {volume: 0.5, playbackRate: 1})
}


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function addPlayer(name) {
  if(name === '') return;

  players.value.push(new Player(name, startScore))

  playerName.value = "";
}

function removePlayer(index) {
  if(gameStarted.value) return;

  players.value.splice(index, 1);
}

function startGame() {
  if(players.value.length === 0) return;
  gameStarted.value = true;

  shuffleArray(players.value);
  currentPlayer.value = 0;
}

function addDart(number, modifier = null) {
  turnScores.value.push(new Dart(number, modifier));
}

function removeDart(index) {
  turnScores.value.splice(index, 1);
  hoveredBox.value = null;
}

function newLeg() {
  for(let player of players.value) {
    player.baseScore = startScore;
    player.darts = [];
    player.lastScore = 0;
  }
  currentPlayer.value = 0;
}

function endTurn() {
  for(let dart of turnScores.value) {
    players.value[currentPlayer.value].addDart(dart);
  }

  sounds[turnScore()].play();

  players.value[currentPlayer.value].lastScore = turnScore();

  turnScores.value = [];

  if(players.value[currentPlayer.value].score() === 0) {
    players.value[currentPlayer.value].legs++;
    if(players.value[currentPlayer.value].legs === legCount.value) {
      finishGame();
      return;
    } else {
      newLeg();
      return;
    }
  }

  currentPlayer.value = (currentPlayer.value + 1) % (players.value.length);
}


function finishGame() {
  finishedGame.value = true;
}

function turnScore() {
  let score = 0;

  for(let dart of turnScores.value) {
    score += dart.score()
  }

  return score;
}

function calculateTargetScore() {
  if(currentPlayer.value === null) return 0;

  return players.value[currentPlayer.value].score() - turnScore();
}

function testEndTurn() {
  addDart(5);
  addDart(5);
  addDart(5);
  endTurn();
}

function isInvalidScore(number, modifier = null) {
  const targetScore = calculateTargetScore();

  let dart = new Dart(number, modifier);

  if(turnScores.value.length >= 3) return true;

  if(dart.score() === targetScore && (dart.modifier === 'd' || dart.score() === 50)) return false;

  return dart.score() >= targetScore - 1;
}

const checkoutCombinations = computed(() => {
  if(currentPlayer.value === null) return [];

  const targetScore = calculateTargetScore();

  if(targetScore === 0) return [];

  return Player.calculateCombinations(targetScore, Array.from(turnScores.value));
});

</script>

<template>

  <div class="container">

    <div class="d-flex gap-2 justify-content-center pt-5">

      <table class="table table-hover table-sm">
        <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Score</th>
          <th scope="col">Avg.</th>
          <th scope="col">Darts</th>
          <th scope="col">Last Score</th>
          <th scope="col">Legs</th>
          <th scope="col">Best Outs</th>
          <th scope="col" v-if="!gameStarted">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(player, index) in players" :key="index">
          <td :class="{ 'bg-success': currentPlayer === index, 'fw-bold': currentPlayer === index }">{{ player.name }}</td>
          <td :class="{ 'bg-success': currentPlayer === index, 'fw-bold': currentPlayer === index }">{{ player.score() }}</td>
          <td :class="{ 'bg-success': currentPlayer === index, 'fw-bold': currentPlayer === index }">{{ player.average() }}</td>
          <td :class="{ 'bg-success': currentPlayer === index, 'fw-bold': currentPlayer === index }">{{ player.darts.length }}</td>
          <td :class="{ 'bg-success': currentPlayer === index, 'fw-bold': currentPlayer === index }">{{ player.lastScore }}</td>
          <td :class="{ 'bg-success': currentPlayer === index, 'fw-bold': currentPlayer === index }">{{ player.legs }}</td>
          <td :class="{ 'bg-success': currentPlayer === index, 'fw-bold': currentPlayer === index }">
              {{ player.possibleOuts().map(combination => combination.map(item => item.name()).join(' ')).join(', ') }}
          </td>
          <td v-if="!gameStarted"><div class="btn btn-danger btn-sm" @click="removePlayer(player.id)"><i class="fa fa-times"></i></div></td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-center" v-if="finishedGame">
      <ConfettiExplosion :particleCount="200" :force="1.0" />

      <div class="card" style="width: 18rem;">
        <img src="/macaw.png" class="card-img-top p-4" alt="macaw">
        <div class="card-body text-center">
          <h5 class="card-title">gefeliciteerd he</h5>
          <p class="card-text">
            <i class="fa fa-crown text-warning"></i> {{ players[currentPlayer].name }} has won!
          </p>
          <a href="/" class="btn btn-primary w-100">New Game</a>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row mt-4" v-if="checkoutCombinations.length > 0">
        <div class="col" v-for="combinations in checkoutCombinations">
          <div class="card">
            <div class="card-body">
              <span class="fs-1 fw-bold">{{ combinations.slice(turnScores.length, 3).map(dart => dart.name()).join(' ') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col" v-for="i in 3">
          <div v-if="turnScores.length >= i" class="box" :class="{'bg-body-secondary': hoveredBox !== i, 'bg-danger': hoveredBox === i}" @mouseover="hoveredBox = i" @mouseleave="hoveredBox = null" @click="removeDart(i - 1)">
            <span class="fw-bold" v-html="hoveredBox === i ? '<i class=\'fa fa-xl fa-times\'></i>' : turnScores[i - 1].name()"></span>
            <span class="fs-5" v-if="turnScores.length === i">&nbsp;Current Score: {{ calculateTargetScore() }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!gameStarted" class="text-center">
      <div class="row">
        <div class="col">
          <div class="d-flex gap-2 justify-content-center flex-column py-5">

            <div class="btn-toolbar mb-3">
              <div class="input-group">
                <div class="input-group-append">
                  <div class="input-group-text" id="btnGroupAddon">@</div>
                </div>
                <input type="text" class="form-control" placeholder="Name" v-model="playerName" @keydown.enter="addPlayer(playerName)">
              </div>
              <div class="btn-group mr-2" role="group">
                <button :disabled="players.length >= 4" type="button" class="btn btn-success" @click="addPlayer(playerName)">Add Player</button>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="d-flex gap-2 justify-content-center flex-column py-5">
            <div class="btn-toolbar mb-3">
              <div class="input-group">
                <div class="input-group-append">
                  <div class="input-group-text" id="btnGroupAddon">Legs</div>
                </div>
                <input type="text" class="form-control" placeholder="Legs" v-model.number="legCount" @keydown.enter="addPlayer(playerName)">
              </div>
            </div>
          </div>
        </div>
      </div>



      <div class="btn btn-success btn-lg fw-bold" @click="addPlayer('test1'); addPlayer('test2'); addPlayer('test3'); addPlayer('test4');">add test players</div>
      <div class="btn btn-success btn-lg fw-bold" v-if="players.length >= 1" @click="startGame">Start Game</div>
    </div>

    <div class="fixed-bottom pb-4 container">
      <div class="w-50 mx-auto d-flex justify-content-center flex-column">
        <div v-if="turnScores.length === 3 && calculateTargetScore() > 0" class="w-100 btn btn-success mt-4 fw-bold" @click="endTurn">End Turn</div>
        <div v-if="currentPlayer !== null && calculateTargetScore() === 0 && players[currentPlayer].legs < legCount - 1" class="w-100 btn btn-success mt-4 fw-bold" @click="endTurn">Next Leg</div>
        <div v-if="finishedGame === false && currentPlayer !== null && calculateTargetScore() === 0 && players[currentPlayer].legs >= legCount - 1" class="w-100 btn btn-success mt-4 fw-bold" @click="endTurn">Finish Game</div>
<!--        <div class="w-100 btn btn-success mt-4 fw-bold" @click="testEndTurn">Test End Turn</div>-->
      </div>

      <div class="d-flex gap-2 justify-content-center mt-4 py-1">

        <div class="btn-group-vertical" role="group">
          <button :disabled="isInvalidScore(0)" class="btn btn-primary" type="button" @click="addDart(0)">0</button>

          <div class="btn-group" role="group">
            <button :disabled="finishedGame || !gameStarted || turnScores.length >= 2" class="btn btn-primary" type="button" @click="addDart(0); addDart(0);">00</button>
            <button :disabled="finishedGame || !gameStarted || turnScores.length >= 1" class="btn btn-primary" type="button" @click="addDart(0); addDart(0); addDart(0);">000</button>
          </div>
        </div>

        <div class="btn-group-vertical" role="group" v-for="n in 10">
          <button :disabled="isInvalidScore(n)" class="btn btn-primary" type="button" @click="addDart(n)">{{ n }}</button>

          <div class="btn-group" role="group">
            <button :disabled="isInvalidScore(n, 'd')" class="btn btn-primary" type="button" @click="addDart(n, 'd')">D</button>
            <button :disabled="isInvalidScore(n, 't')" class="btn btn-primary" type="button" @click="addDart(n, 't')">T</button>
          </div>
        </div>

      </div>

      <div class="d-flex gap-2 justify-content-center py-1">

        <div class="btn-group-vertical" role="group" v-for="n in 10">
          <button :disabled="isInvalidScore(n + 10)" class="btn btn-primary" type="button" @click="addDart(n + 10)">{{ n + 10 }}</button>

          <div class="btn-group" role="group">
            <button :disabled="isInvalidScore(n + 10, 'd')" class="btn btn-primary" type="button" @click="addDart(n + 10, 'd')">D</button>
            <button :disabled="isInvalidScore(n + 10, 't')" class="btn btn-primary" type="button" @click="addDart(n + 10, 't')">T</button>
          </div>
        </div>

        <div class="btn-group-vertical" role="group">
          <button :disabled="isInvalidScore(25)" class="btn btn-primary" type="button" @click="addDart(25)">Bull</button>

          <div class="btn-group" role="group">
            <button :disabled="isInvalidScore(50)" class="btn btn-primary" type="button" @click="addDart(50)">Bull's Eye</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 48px;
  border: 1px solid #dee2e6;
  margin: 10px 0;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
}
.box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
</style>
