//  Keys for accessing the YouTube Data API

const apiKey = "44f0cc0040msh6c60970764cbcedp1e1b6ejsn23554e555aa6";
const apiHost = "youtube-v31.p.rapidapi.com";

// Event listener for the form submission

document.getElementById("videoForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const videoLink = document.getElementById("videoLink").value;
  const videoId = extractVideoId(videoLink);

// Only fetch video details if a valid VideoId is found

  if (videoId) {
    fetchVideoDetails(videoId);
  } else {
    alert("Please paste a valid YouTube video link.");
  }
});

// Function to extract the YouTube video ID from the URL

function extractVideoId(url) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get("v") || urlObj.pathname.split("/").pop();
}
// Function to fetch video details using the video ID

async function fetchVideoDetails(videoId) {
  const videoUrl = `https://youtube-v31.p.rapidapi.com/videos?part=snippet&id=${videoId}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": apiHost,
    },
  };

  try {
    const response = await fetch(videoUrl, options);
    const result = await response.json();
    const videoSnippet = result.items[0].snippet;
    displayVideoInfo(videoSnippet); // Displays the video title and thumbnail
    fetchComments(videoId); // Fetches comments for the video (Max result = 30 Comments)
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to display the video title and thumbnail

function displayVideoInfo(videoSnippet) {
  const videoResults = document.getElementById("videoResults");
  videoResults.innerHTML = `
        <h3>${videoSnippet.title}</h3>
        <img src="${videoSnippet.thumbnails.medium.url}" alt="${videoSnippet.title}">
    `;
}
// Function to fetch comments for the video

async function fetchComments(videoId) {
  const commentsUrl = `https://youtube-v31.p.rapidapi.com/commentThreads?part=snippet&videoId=${videoId}&maxResults=30`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": apiHost,
    },
  };

  try {
    const response = await fetch(commentsUrl, options);
    const commentsResult = await response.json();
    const commentsContainer = document.getElementById("videoResults");

    // Iterates over each comment and displays it with an "Add to Favorites" button

    commentsResult.items.forEach((comment) => {
      const commentElement = document.createElement("div");
      commentElement.innerHTML = `
                <p><strong>${comment.snippet.topLevelComment.snippet.authorDisplayName}</strong>: ${
        comment.snippet.topLevelComment.snippet.textDisplay
      }</p>
                <button onclick="addCommentToFavorites(${JSON.stringify(
                  comment.snippet.topLevelComment.snippet
                ).replace(/"/g, "&quot;")})">Add to Favorites</button>
            `;
      commentsContainer.appendChild(commentElement);
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
}

//* CRUD Operations *

// Create: Adds a comment to favorites

function addCommentToFavorites(comment) {
  const favorites = getFavorites();
  favorites.push(comment);
  saveFavorites(favorites);
  renderFavorites();
}

// Read: Retrieves the list of favorite comments from Local Storage

function getFavorites() {
  const favorites = localStorage.getItem("favorites");
  return favorites ? JSON.parse(favorites) : [];
}

// Update: Saves the updated list of favorite comments to Local Storage

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Render: Displays the list of favorite comments on the page

function renderFavorites() {
  const favoritesList = document.getElementById("favoritesList");
  favoritesList.innerHTML = "";
  const favorites = getFavorites();

  // Iterates over each favorite and creates a list item with Edit and Delete buttons

  favorites.forEach((comment, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <strong>${comment.authorDisplayName}</strong>: ${comment.textDisplay}
            <button onclick="editFavorite(${index})">Edit</button>
            <button onclick="deleteFavorite(${index})">Delete</button>
        `;
    favoritesList.appendChild(li);
  });
}

// Update: Edits an existing favorite comment

function editFavorite(index) {
  const favorites = getFavorites();
  const newText = prompt("Edit your comment:", favorites[index].textDisplay);
  if (newText) {
    favorites[index].textDisplay = newText;
    saveFavorites(favorites);
    renderFavorites();
  }
}

// Delete: Removes a comment from the favorites list

function deleteFavorite(index) {
  const favorites = getFavorites();
  favorites.splice(index, 1);
  saveFavorites(favorites);
  renderFavorites();
}

// Initial rendering of saved favorites when the page loads

renderFavorites();
