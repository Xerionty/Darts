<script setup>
import {computed, ref} from 'vue'
import Player from './models/Player.js'
import Dart from "./models/Dart.js";
import ConfettiExplosion from "vue-confetti-explosion";

const players = ref([ new Player(1, "Marvin"), new Player(2, "Melvin"), new Player(3, "Lesley"), new Player(4, "Patrick") ])
const currentPlayer = ref(1)
const turnScores = ref([])

const hoveredBox = ref(null)
const confetti = ref(false)

function getPlayerById(id) {
  for(let player of players.value) {
    if(player.id === id) return player;
  }

  return null;
}

function addDart(number, modifier = null) {
  turnScores.value.push(new Dart(number, modifier));
}

function removeDart(index) {
  turnScores.value.splice(index, 1);
}

function endTurn() {
  for(let dart of turnScores.value) {
    getPlayerById(currentPlayer.value).addDart(dart);
  }

  getPlayerById(currentPlayer.value).lastScore = turnScore();

  if(getPlayerById(currentPlayer.value).score() === 0) {
    finishGame();
  }
  turnScores.value = [];
  currentPlayer.value = (currentPlayer.value) % (players.value.length) + 1;
}

function finishGame() {
  confetti.value = true;
}

function turnScore() {
  let score = 0;

  for(let dart of turnScores.value) {
    score += dart.score()
  }

  return score;
}

function calculateTargetScore() {
  return getPlayerById(currentPlayer.value).score() - turnScore();
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
  const targetScore = calculateTargetScore();

  return getPlayerById(currentPlayer.value).calculateCombinations(targetScore, Array.from(turnScores.value));
});

</script>

<template>

  <div class="container">

    <div class="d-flex gap-2 justify-content-center py-5">

      <table class="table table-hover table-sm">
        <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Name</th>
          <th scope="col">Score</th>
          <th scope="col">Avg.</th>
          <th scope="col">Darts</th>
          <th scope="col">Last Score</th>
          <th scope="col">Possible Outs</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="player in players" :key="player.id">
          <th scope="row" :class="{ 'bg-success': currentPlayer === player.id }">{{ player.id }}</th>
          <td :class="{ 'bg-success': currentPlayer === player.id }">{{ player.name }}</td>
          <td :class="{ 'bg-success': currentPlayer === player.id }">{{ player.score() }}</td>
          <td :class="{ 'bg-success': currentPlayer === player.id }">{{ player.average() }}</td>
          <td :class="{ 'bg-success': currentPlayer === player.id }">{{ player.darts.length }}</td>
          <td :class="{ 'bg-success': currentPlayer === player.id }">{{ player.lastScore }}</td>
          <td :class="{ 'bg-success': currentPlayer === player.id }">{{ player.possibleOuts() }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-center">
      <ConfettiExplosion v-if="confetti" :particleCount="200" :force="1.0" />
    </div>

    <div class="container">
      <h2 v-if="checkoutCombinations.length > 0">
        <span v-for="combinations in checkoutCombinations">
          <span v-for="dart in combinations.slice(turnScores.length, 3)">
            {{ dart.name() }}&nbsp;
          </span>
          <br>
        </span>
      </h2>

      <div class="row">
        <div class="col" v-for="i in 3">
          <div v-if="turnScores.length >= i" class="box" :class="{'bg-body-secondary': hoveredBox !== i, 'bg-danger': hoveredBox === i}" @mouseover="hoveredBox = i" @mouseleave="hoveredBox = null" @click="removeDart(i - 1)">
            <span class="fw-bold" v-html="hoveredBox === i ? '<i class=\'fa fa-xl fa-times\'></i>' : turnScores[i - 1].name()"></span>
            <span class="fs-5" v-if="turnScores.length === i">&nbsp;Current Score: {{ calculateTargetScore() }}</span>
          </div>
        </div>
      </div>
      <div v-if="turnScores.length === 3" class="w-100 btn btn-success mt-4 fw-bold" @click="endTurn">End Turn</div>
      <div v-if="calculateTargetScore() === 0" class="w-100 btn btn-success mt-4 fw-bold" @click="endTurn">Finish Game</div>
      <div class="w-100 btn btn-success mt-4 fw-bold" @click="testEndTurn">Test End Turn</div>
    </div>

    <div class="d-flex gap-2 justify-content-center mt-4 py-1">

      <div class="btn-group-vertical" role="group">
        <button :disabled="isInvalidScore(0)" class="btn btn-primary" type="button" @click="addDart(0)">0</button>

        <div class="btn-group" role="group">
          <button :disabled="turnScores.length >= 2" class="btn btn-primary" type="button" @click="addDart(0); addDart(0);">00</button>
          <button :disabled="turnScores.length >= 1" class="btn btn-primary" type="button" @click="addDart(0); addDart(0); addDart(0);">000</button>
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

    <div class="d-flex gap-2 justify-content-center py-5">

      <div class="btn-toolbar mb-3" role="toolbar" aria-label="Toolbar with button groups">
        <div class="input-group">
          <div class="input-group-append">
            <div class="input-group-text" id="btnGroupAddon">@</div>
          </div>
          <input type="text" class="form-control" placeholder="Name" aria-label="Player Name" aria-describedby="btnGroupAddon">
        </div>
        <div class="btn-group mr-2" role="group" aria-label="First group">
          <button type="button" class="btn btn-success">Add Player</button>
        </div>
      </div>

      <div class="btn-toolbar mb-3" role="toolbar" aria-label="Toolbar with button groups">
        <div class="input-group">
          <div class="input-group-append">
            <div class="input-group-text" id="btnGroupAddon">#</div>
          </div>
          <input type="text" class="form-control" placeholder="Player #" aria-label="Player #" aria-describedby="btnGroupAddon">
        </div>
        <div class="btn-group mr-2" role="group" aria-label="First group">
          <button type="button" class="btn btn-danger">Remove Player</button>
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
