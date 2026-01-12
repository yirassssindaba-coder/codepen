const forumLatest = "https://forum-proxy.freecodecamp.rocks/latest";
const userAvatarPrefix = "sea1.discourse-cdn.com";

const postsContainer = document.getElementById("posts-container");
const loadingIndicator = document.getElementById("loading");

async function fetchForumPosts() {
  try {
    const response = await fetch(forumLatest);
    const data = await response.json();
    
    const { users, topic_list } = data;
    const { topics } = topic_list;

    loadingIndicator.style.display = "none";
    renderPosts(topics, users);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    loadingIndicator.innerText = "Gagal memuat data. Silakan coba lagi.";
  }
}

// Fungsi menghitung waktu lampau
function timeAgo(time) {
  const now = new Date();
  const lastPost = new Date(time);
  const seconds = Math.floor((now - lastPost) / 1000);
  
  if (seconds < 3600) return Math.floor(seconds / 60) + "m";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h";
  return Math.floor(seconds / 86400) + "d";
}

function renderPosts(topics, users) {
  postsContainer.innerHTML = topics.map((topic, index) => {
    return `
      <tr>
        <td>${index + 1}</td>
        <td>
          <a class="topic-title" href="forum.freecodecamp.org{topic.slug}/${topic.id}" target="_blank">
            ${topic.title}
          </a>
        </td>
        <td>
          <div class="avatar-list">
            ${topic.posters.map(poster => {
              const user = users.find(u => u.id === poster.user_id);
              const avatar = user.avatar_template.replace('{size}', '30');
              const avatarUrl = avatar.startsWith("http") ? avatar : userAvatarPrefix + avatar;
              
              return `
                <a href="forum.freecodecamp.org{user.username}" target="_blank">
                  <img src="${avatarUrl}" title="${user.username}" alt="${user.username}">
                </a>
              `;
            }).join('')}
          </div>
        </td>
        <td>${topic.posts_count - 1}</td>
        <td>${topic.views}</td>
        <td>${timeAgo(topic.bumped_at)}</td>
      </tr>
    `;
  }).join('');
}

fetchForumPosts();
