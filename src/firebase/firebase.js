// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'

import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  deleteDoc,
  writeBatch,
  limit,
  runTransaction
} from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAvWFL-YiKRLGXPM2Or8LpKd4JezmSDRho',
  authDomain: 'vue-expense-tracker-732c5.firebaseapp.com',
  projectId: 'vue-expense-tracker-732c5',
  storageBucket: 'vue-expense-tracker-732c5.appspot.com',
  messagingSenderId: '721317815908',
  appId: '1:721317815908:web:333c628a469ee0d8f56171'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db, doc, collection, getDoc, getDocs, setDoc, query, where, deleteDoc, writeBatch, limit, runTransaction }
