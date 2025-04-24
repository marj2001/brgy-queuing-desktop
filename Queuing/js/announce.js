
        function confirmAnnouncement() {
            const announcementText = document.getElementById("announcement-input").value;
            if (!announcementText.trim()) {
                swal("Oops!", "Please type your announcement before confirming.", "error");
                return;
            }
            
            swal({
                title: "Confirm Announcement",
                text: "Are you sure you want to announce this?",
                icon: "warning",
                buttons: ["Cancel", "Confirm"],
                dangerMode: true,
            }).then((willAnnounce) => {
                if (willAnnounce) {
                 
                    swal("Announcement has been made!", {
                        icon: "success",
                    });
                 
                    document.getElementById("announcement-input").value = '';
                }
            });
        }
