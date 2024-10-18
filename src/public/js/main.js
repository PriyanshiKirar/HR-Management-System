// Add any client-side JavaScript here
console.log('HR Management System loaded');

// Example: Automatically fill in geolocation for attendance recording
if (document.getElementById('latitude') && document.getElementById('longitude')) {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      document.getElementById('latitude').value = position.coords.latitude;
      document.getElementById('longitude').value = position.coords.longitude;
    });
  }
}
