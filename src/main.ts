import { createClient } from '@supabase/supabase-js';

// Thay thế bằng Supabase URL và Anon Key của bạn
const supabaseUrl = 'https://gxshearnxcmnszxnqfum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4c2hlYXJueGNtbnN6eG5xZnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1OTIwMzIsImV4cCI6MjA0MzE2ODAzMn0.4jHRRXcINB46OjbWCDWCuWC4LAt-OiJovv8N8H0jjpg';
const supabase = createClient(supabaseUrl, supabaseKey);

// Định nghĩa kiểu cho tin nhắn
interface Message {
  id: number;
  username: string;
  message: string;
  inserted_at: string;
}

// Hàm gửi tin nhắn
async function sendMessage(username: string, message: string) {
    const { error } = await supabase
        .from('messages')
        .insert([{ username, message }]);
    if (error) console.error('Lỗi khi gửi tin nhắn:', error);
}
console.log('login')
// // Hàm lấy tin nhắn

async function fetchMessages() {
    const { data, error } = await supabase
        .from('messages') // Table name as string
        .select<Message>('*') // Select method with row type argument <Message>
        .order('inserted_at', { ascending: true });

    if (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
        return;
    }

    const messageContainer = document.getElementById('messages') as HTMLDivElement;
    if (data) {
        messageContainer.innerHTML = data
            .map(msg => `<p><strong>${msg.username}:</strong> ${msg.message}</p>`)
            .join('');
    }
}

// Lắng nghe sự kiện realtime
supabase
  .channel('messages-channel')  // Create or use a channel for real-time subscriptions
  .on(
    'postgres_changes',  // Listen to changes in the database
    { event: 'INSERT', schema: 'public', table: 'messages' },  // Specify the event type, schema, and table
    (payload) => {
      const messageContainer = document.getElementById('messages') as HTMLDivElement;
      const newMessage = `<p><strong>${payload.new.username}:</strong> ${payload.new.message}</p>`;
      messageContainer.innerHTML += newMessage;
    }
  )
  .subscribe();

// Gửi tin nhắn khi người dùng click
document.getElementById('sendButton')?.addEventListener('click', () => {
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const message = (document.getElementById('message') as HTMLInputElement).value;
    sendMessage(username, message);
});

// Gọi hàm để tải tin nhắn ban đầu


fetchMessages();
