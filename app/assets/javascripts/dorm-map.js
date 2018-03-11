$(".controller-dorms.action-show").ready(function() {
  $('.dropdown-toggle').dropdown();

  // Get the modal
  var pullModal = document.getElementById('pull-form-modal');
  var adminPullModal = document.getElementById('admin-pull-form-modal');
  var adminModal = document.getElementById('admin-modal');

  // Get the button that opens the modal
  var btn = document.getElementById("myBtn");
  var index;
  var selectedRooms = []; // Holds list of rooms which have been selected for a pull.
  var singleSelect = false;

  var selectedToggle = function(data) {
    var index = selectedRooms.indexOf(data);
    if (index !== -1) {
      selectedRooms.splice(index, 1); 
    } else {
      selectedRooms.push(data); 
    }
    // Only show the option to create a pull if a room is selected
    if (selectedRooms.length > 0) {
      $("#admin-pull-options").show();
      $("#student-create-pull").show();
    } else {
      $("#admin-pull-options").hide();
      $("#student-create-pull").hide();
    }
  }

  $(".close").click(function() {
    pullModal.style.display = "none";
    adminPullModal.style.display = "none";
    adminModal.style.display = "none";
  });

  // Have the admin buttons toggle their respective divs
  $("#mark-unpullable").click(function() {
    $("#unpullable-form").toggleClass("hidden");
  });
  $("#pull-student").click(function() {
    $("#student-pull-form").toggleClass("hidden");
  });
  $("#create-pull").click(function() {
    $("#pull-form").toggleClass("hidden");
  });
  $("#edit-pull").click(function() {
    $("#edit-pull-form").toggleClass("hidden");
  });

  $("#single-select").click(function() {
    if ($(this).is(":checked")) {
      // Hide admin options
      singleSelect = true;
      selectedRooms = [];
      $(".room-cell").removeClass("selected");
    } else {
      // Reveal admin options
      singleSelect = false;
    }
  });

  $("#pull-as-student").click(function() {
    if ($(this).is(":checked")) {
      // Hide admin options
      singleSelect = false;
      selectedRooms = [];
      $(".room-cell").removeClass("selected");
      $("#admin-pull-options").addClass("hidden");
      $("#single-select-div").addClass("hidden");
      $("#student-create-pull").removeClass("hidden");
    } else {
      // Reveal admin options
      singleSelect = false;
      $("#admin-pull-options").removeClass("hidden");
      $("#single-select-div").removeClass("hidden");
      $("#student-create-pull").addClass("hidden");
    }
  })

  $("#student-create-pull").click(function() {
    openPullForm(false, pullModal);
  });

  $("#admin-create-pull").click(function() {
    openPullForm(true, adminPullModal);
  });

  var openPullForm = function(isAdmin, modalToShow) {
    trimmed_selected = []
    // Strip out unnecessary values
    for (var i = 0; i < selectedRooms.length; i++) {
      var room = selectedRooms[i];
      trimmed_selected.push([room.number, room.capacity, room.id])
    }

    var url;
    if (isAdmin) {
      url = dormId + '/create_admin_multi_pull_ajax/' + JSON.stringify(trimmed_selected);
    } else {
      url = dormId + '/create_pull_ajax/' + JSON.stringify(trimmed_selected);
    }
    $.ajax({
      url: url,
      type: 'POST',
      dataType: 'script',
      success: function(data){
        eval(data);
        if(!isAdmin) hideInvalidStudentIds();
        modalToShow.style.display = "block";
      }
    })
  }

  // Fade out error messages after a bit
  $(".alert-div").fadeOut(8000);
  var fillingForm = false;
  var dormElements = [];

  var floorHold = $('<div>').css({
      position: 'absolute',
      left: 270,
      top: 223,
      height: 34,
      width: 115,
      background: 'rgb(255, 255, 255)',
      border: '1px solid rgb(200, 200, 200)',
      'border-radius': '5px',
      visibility: 'hidden',
  }).attr('id', 'floorHold').appendTo('body');

  var floorSelect = $('<div>').css({
      position: 'absolute',
      left: 270,
      top: 188,
      height: 34,
      width: 115,
      'font-size': '14px',
      'text-align': 'center',
      'line-height': '30px',
      color: 'black',
      border: '1px solid rgb(200, 200, 200)',
      'border-radius': '5px',
  }).attr('id', 'floorSelect').text('switch floors')
  .on('click', function(event){
      if (floorHold.css('visibility') !== 'visible') {
          floorHold.css({
              visibility: 'visible',
              'z-index': 100,
          });
      }
      else {
          floorHold.css({
              visibility: 'hidden',
              'z-index': 0,
          });
      }
  })
  .on('mouseenter', function(){
      $(this).css({
          background: 'rgb(232, 232, 232)',
      });
  })
  .on('mouseleave', function(){
      $(this).css({
          background: 'none',
      });
  })
  .appendTo('body');

  var heightCount = 0;
  $('.map').each(function(i) {
      heightCount++;
      $('<div>').css({
          position: 'absolute',
          left: 0,
          top: i*35,
          height: 33,
          width: 113,
          'border-radius': '5px',
          'text-align': 'center',
          'font-size': '17px',
          'z-index': 100,
      }).text(i+1).appendTo(floorHold)
      .on('click', function(){
          sessionStorage.setItem("floorLevel", i);
          location.reload();
      })
      .on('mouseenter', function(){
          $(this).css({
              background: 'rgb(232, 232, 232)',
          });
      })
      .on('mouseleave', function(){
          $(this).css({
              background: 'none',
          });
      });
  });
  floorHold.css({
      height: heightCount*35,
  });

  // Don't show student pull options by default to admins. #TODO
  if (admin) {
    $("#student-create-pull").addClass("hidden");
  }

  function layout(level) {  
    for (var i = 0; i < dormElements.length; i++) {
        if (dormElements[i] !== undefined) {
            dormElements[i].remove();
        }
    }
    sessionStorage.setItem("curDorm", curDorm);
    dormElements = [];
    //get dorm room data
    var roomData; 
    switch (level) {
        case 0:
            roomData = level1;
            break;
        case 1:
            roomData = level2;
            break;
        case 2:
            roomData = level3;
            break;
        default:
            
    }
    var room, val;

    //speciifc floor layout coordinates
    var i = 0;
    var x = 0;
    var roomPullNum;
    var roomRankNum;
    var curRoomNum;
    var userInRoom;
    var preplaced;

    //create image tag to size map correctly
    var imgLev = level + 1;
    var img = document.getElementById('floor' + imgLev);
    var dims;
    try {
      dims = JSON.parse($(img).attr("data-dims"));
    } catch(e) {
      img = document.getElementById('floor' + 1);
      dims = JSON.parse($(img).attr("data-dims"));
      level = 0;
    }
    var width = dims[0];
    var height = dims[1];
    var ratio = height / width;
    var floor = mapLayout.floors[level + 1];
    var map = $(img).attr("src");

    //create dorm map 
    var fakeDorm = $('<div>').css({
        position: 'absolute',
        left: 90,
        top: 350,
        width: 940,
        height: 940*ratio,
        'background-image': "url(" + map + ")",
        'background-size':  'contain',
        border: '5px solid black',
    }).appendTo('body');
    dormElements.push(fakeDorm);

    //get keys so that you can traverse js by index
    var keysbyindex = Object.keys(floor);
    while (x < keysbyindex.length) {
        userInRoom = false;
        preplaced = false;
        //get data for room
          val = floor[keysbyindex[x]];
          room = $('<div>').css({
              position: 'absolute',
              left: 100*(val.bounding_box.x)+'%',
              top: 100*(val.bounding_box.y)+'%',
              height: 100*(val.bounding_box.h)+'%',
              width: 100*(val.bounding_box.w)+'%',
              background: 'none',
              color: 'black',
              'font-size': '10px',
          }).appendTo(fakeDorm);
          $(room).addClass("room-cell");


          dormElements.push(room);
          
          //get db info about room
          if (roomData[i] !== undefined) {
              room.info = roomData[i];
              room.info.clickable = true;
              
              //need to check if student_id is equal to current_user.student.id
              //then you know if you are in room use bool in the while loop later
              
              //get names of students in room, possibly max of room draw numbers
              roomPullNum = null;
              roomRankName = null;
              room.curNames = [];
              curRoomNum = roomData[i].number;
              while (curRoomNum === roomData[i].number) {
                  if (roomData[i].student_id === studentId) {
                      room.css({
                          background: 'rgb(234, 170, 0)',
                      });
                      userInRoom = true;
                  }
                  if (roomData[i].pull_id !== null) {
                      roomPullNum = roomData[i].pull_number;
                      roomRankNum = roomData[i].pull_rank;
                      round = roomData[i].round;
                      switch(roomRankNum) {
                        case 0:
                          roomRankName = "Senior";
                          break;
                        case 1:
                          roomRankName = "Super-senior";
                          break;
                        case 2:
                          roomRankName = "Junior";
                          break;
                        case 3:
                          roomRankName = "Sophomore";
                          break;
                      }

                  }
                  
                  if (roomData[i].first_name !== null) {
                      room.curNames.push(roomData[i].first_name+' '+roomData[i].last_name);  
                  }
                  i++;
                  if (roomData[i] === undefined) {
                      break;
                  }
              }
              if (room.curNames[0] != null) {
                  string = '<em> ' + roomRankName + ' ' + roomPullNum + ' ';
                  if (roomRankNum < 2) {string+= "round " + round}
                  if (room.info.message !=null) {string+="</em> <br>" + room.info.message};
                  room.popover({
                    trigger: 'hover',
                    html: 'true',
                    title: curDorm[0].toUpperCase() + curDorm.slice(1) + " " + room.info.number,
                    content: string,
                  });
              }
              //check if your room draw number is lower or the roomo is not pulled at all
              if ((((roomRankNum > userRankNum || (roomRankNum === userRankNum && userDrawNum < roomPullNum)) && room.info.assignment_type === 2)) && !userInRoom) {
                  room.css({
                      background: 'rgb(183, 191, 16)',
                  });
              }
              else if(room.info.assignment_type === null) {
                room.css({
                    background: 'rgb(0, 127, 163)',
                })
              }
              //room is pulled by someone with higher number
              else if(((((userDrawNum > roomPullNum && roomRankNum === userRankNum) || userRankNum > roomRankNum) && room.info.assignment_type === 2) || room.assignment_type !== 2) && !userInRoom) {
                  room.info.clickable = true;
                  room.css({
                      background: 'rgb(91, 103, 112)',
                  });
                  if (room.info.assignment_type === 1) {
                      preplaced = true;
                      room.info.clickable = false;
                      room.text('frosh');
                  }
                  else if (room.info.assignment_type !== 2) {
                      preplaced = true;
                      room.info.clickable = false;
                      room.text('preplaced/ unavailable');
                  }
              }

              // If not in draw period, don't let people click
              if (!period) {
                room.info.clickable = false;
              }


              
              
          }//if no db info on room ie undefined in roomData then just say its open
          else {
              room.css({
                  background: 'rgb(0, 127, 163)',
              });
          }
          
          if (!preplaced) {
              if (room.curNames !== undefined) {
                  if (room.curNames[0] !== undefined) {
                      var nameString = '';
                      for (var j = 0; j < room.curNames.length; j++) {
                          nameString = nameString + room.curNames[j] +', ';
                      }
                      room.text(nameString.substring(0, nameString.length-2));
                  }
              }
          }
          
          
          room.on('mouseenter', function(){
             $(this).css({
                 opacity: .5,
             }); 
          });
          
          room.on('mouseleave', function(){
             $(this).css({
                    opacity: 1,
             }); 
          });
          
          room.on('click', {info: room.info}, function(event) {
             // If singleSelect is checked, open the normal admin form
            if (singleSelect && admin) {
              adminModal.style.display = "block";
            }
            // Highlight the selected room pink and add it to the list of selected rooms
            else if (admin || event.data.info.clickable) {
              selectedToggle(event.data.info);
              $(event.target).toggleClass("selected");
            }
          });
        x++;
    }
	}

	//TODO: Figure out what this is for?
	window.onclick = function(event) {
		if (event.target == pullModal) {
			pullModal.style.display = "none";
			fillingForm = false;
		}
		if (event.target == adminModal) {
			adminModal.style.display = "none";
			fillingForm = false;
		}
		if (event.target == adminPullModal) {
			adminPullModal.style.display = "none";
			fillingForm = false;
		}
	}

	//TODO: figure out what this is
	window.onkeyup = function(event) {
		if (event.keyCode == 27) {
			adminModal.style.display = "none";
			pullModal.style.display = "none";
			fillingForm = false;
			floorHold.css({
					visibility: 'hidden',
					'z-index': 0
			});
		}
	}

	$(document).click(function(event) { 
		if(!$(event.target).closest('#floorHold').length && !$(event.target).closest('#floorSelect').length) {
			if($('#floorHold').css("visibility") === 'visible') {
				$('#floorHold').css({
					visibility: 'hidden',
					'z-index': 0
				});
			}
		}        
	});

	// update info timer with refresh
	setInterval(function(){
		if (!fillingForm || modal.style.display === 'none') {
			location.reload();
		}
	}, 60000);


	if (sessionStorage.getItem("floorLevel") === null || sessionStorage.getItem("curDorm") === null || sessionStorage.getItem("curDorm") !== curDorm) {
		layout(0);
	}
	else {
		layout(parseInt(sessionStorage.getItem("floorLevel")));
	}
	
	var hideInvalidStudentIds = function() {
		validIds = new Set();
		$(".room_assignment_student_id").each(function() {
			validIds.add(this.value);
		});
		
		firstValidOption = null;
		$("#student_id_select > option").each(function(index, item) {
			sel = $(item);
			if(validIds.has(this.value)) {
				if(firstValidOption == null) firstValidOption = this.value;
				sel.removeAttr('hidden');
				sel.removeAttr("disabled");
			} else {
				sel.removeAttr("selected");
				sel.attr("hidden","hidden");
				sel.attr("disabled","disabled");
			}
		});
		// if the selected option is invalid, change it
		if (!validIds.has($("#student_id_select").val())) {
			$("#student_id_select").val(firstValidOption);
		}
	}
	
	
	$("#pull-form-modal").on("change", ".room_assignment_student_id", function(e){
		hideInvalidStudentIds();
	});
})















