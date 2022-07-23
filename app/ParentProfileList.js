"use strict";
import { db } from "../firebase.js"
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";

export var JobPostData;

const JobListWrapper = document.querySelector(".parent-profile-list-wrapper");
let JobPostSnapshot = [];
let RatingStars ;
const RatingActive= "fa-solid fa-star rating-active";
const RatingInactive= "fa-solid fa-star rating-inactive";

async function getparents() {
    const parentsList = query(collection(db, "user"), where("user_type", "==", "Parent"));
    await getDocs(parentsList).then(async (snapshot) => {
        const posts = await getParentJobPosts();
        snapshot.docs.forEach((doc) => {
            if (posts[doc.id] !== undefined) {
                console.log(doc.id);
                renderParent(doc.id, doc.data(), posts[doc.id].pay_rate, posts[doc.id].looking_for || 'my kids', posts[doc.id].schedule);

            }
        });
    });
}

async function getParentJobPosts() {
    const snapshot = await getDocs(collection(db, "events"));
    let PostsByParentId = {};
    snapshot.docs.forEach((doc) => {
        PostsByParentId[doc.data().parent_id] = doc.data();
        JobPostSnapshot.push(doc.data());
        //console.log(doc.data().parent_id);
    });
    return PostsByParentId;
}

function renderParent(id, Parent, pay_rate, looking_for,schedule) 
{
    document.querySelector(".parent-profile-list-wrapper").innerHTML += `
        <div class="Parent-profile" id="${id}-parent-profile">
            <div class="profile-image">
                <img src="https://picsum.photos/40/40" alt="">
            </div>
            <div class="profile-details">
                <p>${Parent.full_name}</p>
                <p>Location: <span>${Parent.city} </span></p>
                <p>For: <span>${looking_for}</span></p>
                <p>Pay rate:<span>${pay_rate}</span></p>
                <div class="schedule-display-main">
                    <h4>When:</h4>
                    <ul id="${id}scheduleOutput" class="schedule-display-list">
                        <li class="sunday">S</li>
                        <li class="monday">M</li>
                        <li class="tuesday">T</li>
                        <li class="wednesday">W</li>
                        <li class="thursday">T</li>
                        <li class="friday">F</li>
                        <li class="saturday">S</li>
                    </ul>
                </div>
                <ul id="${id}reviewsDisplay" class="reviewsDisplay">
                    <li class="rating1"><i class="fa-solid fa-star rating-inactive"></i></li>
                    <li class="rating2"><i class="fa-solid fa-star rating-inactive"></i></li>
                    <li class="rating3"><i class="fa-solid fa-star rating-inactive"></i></li>
                    <li class="rating4"><i class="fa-solid fa-star rating-inactive"></i></li>
                    <li class="rating5"><i class="fa-solid fa-star rating-inactive"></i></li>
                </ul>
                <button id="${id}" class="more-info">More info</button>
            </div>
         </div>
        `
    
    let calendar_days= schedule; //get schedule values from event
    let ScheduleDisplayID = document.getElementById(id+"scheduleOutput");
    let ScheduleListElements = [...ScheduleDisplayID.getElementsByTagName("li")];
    renderSchedule(ScheduleDisplayID,calendar_days);
    
    let RatingCountDisplayID = document.getElementById(id+"reviewsDisplay");
    RatingStars = [...RatingCountDisplayID.getElementsByClassName("fa-star")];
    renderRatings(Parent.ratings,RatingStars);
}

function render_button_id() {
    JobPostSnapshot.forEach((doc) => {
        let parentID = doc.parent_id;
        let pid = document.getElementById(parentID);
        if (pid !== null) 
        {
            pid.addEventListener('click', () => {
                if (!sessionStorage.getItem('LoginId')) {
                    alert("you should be logged in to learn more!");
                }
                else {
                    JobPostData = doc;
                    sessionStorage.setItem("CurrentParentPostIndex", doc.parent_id);
                    console.log(sessionStorage.getItem("CurrentParentPostIndex"));
                    location.replace("#parentjobpost");
                }
            });
        }
        else {
            console.log('No ID found');
        }
    });
}

function renderRatings(ratings,RatingStars){
    let starsDisplay = parseFloat(ratings.stars).toFixed(2);
    let count=ratings.count;
      for (let i = 0; i<5; i++)
      { 
       if(i<parseInt(starsDisplay)){
          RatingStars[i].className = RatingActive;
        }
        else{
          RatingStars[i].className = RatingInactive;
        }
      }
}

function renderSchedule(ScheduleDisplayID,calendar_days)
{
  if(calendar_days!=null)
  {
    for(let day of calendar_days)
    {
      day= day.toLowerCase();
      let day_id= ScheduleDisplayID.getElementsByClassName(day);
      day_id[0].style.backgroundColor = "rgba(44, 171, 128, 1)";
      day_id[0].style.color = "rgba(255, 255, 255, 1)";
    }
  }
}

init();

async function init() {
    await getparents();
    render_button_id();
};