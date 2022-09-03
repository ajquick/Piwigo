jQuery(document).ready(function() {

  jQuery('.tiptip').tipTip({
    'delay' : 0,
    'fadeIn' : 200,
    'fadeOut' : 200
  });

  
  $('#cat-properties-save').click(() => {
    save_button_set_loading(true)
    $('.info-error,.info-message').hide()

    jQuery.ajax({
      url: "ws.php?format=json&method=pwg.categories.setInfo",
      type:"POST",
      data: {
        category_id: album_id,
        name: $("#cat-name").val(),
        comment: $("#cat-comment").val(),
        status: $("#cat-locked").is(":checked")? "public":"private",
        commentable: $("#cat-commentable").is(":checked")? "true":"false",
        apply_commentable_to_subalbums: $("#cat-apply-commentable-on-sub").is(":checked")? "true":"false",
      },
      success:function(data) {
        save_button_set_loading(false)

        $('.info-message').show()
        setTimeout(
          function() {
            $('.info-message').hide()
          }, 
          5000
        )
      },
      error:function(XMLHttpRequest, textStatus, errorThrows) {
        save_button_set_loading(false)

        $('.info-error').show()
        setTimeout(
          function() {
            $('.info-error').hide()
          }, 
          5000
        )
        console.log(errorThrows);
      }
    });
  })

  function save_button_set_loading(state = true) {
    if (state) {
      $('#cat-properties-save i').removeClass("icon-floppy")
      $('#cat-properties-save i').addClass("icon-spin6")
      $('#cat-properties-save i').addClass("animate-spin")
    } else {
      $('#cat-properties-save i').addClass("icon-floppy")
      $('#cat-properties-save i').removeClass("icon-spin6")
      $('#cat-properties-save i').removeClass("animate-spin")
    }

    $('#cat-properties-save').attr("disabled", state)
  }

  $(".deleteAlbum").on("click", function() {
    
    $.confirm({
      title: str_delete_album,
      content : function () {
        const self = this
        return $.ajax({
          url: "ws.php?format=json&method=pwg.categories.calculateOrphans",
          type: "GET",
          data: {
            category_id: album_id,
          },
          success: function (raw_data) {
            let data = JSON.parse(raw_data).result[0]

            let message = "<p>" + str_delete_album_and_his_x_subalbums
              .replace("%s", "<strong>"+album_name+"</strong>")
              .replace("%d", "<strong>"+nb_sub_albums+"</strong>") + "</p>"
            

            message += 
              `<div  ${data.nb_images_recursive? "":"style='display:none'"}> 
                <input type="radio" name="deletion-mode" value="no_delete" id="no_delete" checked>
                <label for="no_delete">${str_dont_delete_photos}</label>
              </div>`;

            if (data.nb_images_recursive) {
              let t = 0
              message += `<div> 
                <input type="radio" name="deletion-mode" value="force_delete" id="force_delete">
                <label for="force_delete">${str_delete_all_photos.replaceAll("%d", _ => [data.nb_images_recursive, data.nb_images_associated_outside][t++])}</label>
              </div>`;
            }

            if (data.nb_images_becoming_orphan)
              message += 
              `<div> 
                <input type="radio" name="deletion-mode" value="delete_orphans" id="delete_orphans">
                <label for="delete_orphans">${str_delete_orphans.replace("%d", data.nb_images_becoming_orphan)}</label>
              </div>`;

            self.setContent(message)
          },
          error: function(message) {
            console.log(message);
            self.setContent("An error has occured while calculating orphans")
          }
        });
      },
      buttons: {
        deleteAlbum: {
          text: str_delete_album,
          btnClass: 'btn-red',
          action: function () {
            this.showLoading()
            let deletionMode = $('input[name="deletion-mode"]:checked').val();
            delete_album(deletionMode)
            .then(()=>window.location.href = u_delete)
            .catch((err)=> {
              this.close()
              console.log(err)
            })
            return false
          },
        },
        cancel: {
          text: str_cancel
        }
      },
      ...jConfirm_confirm_options
    })
  });

  function delete_album(photo_deletion_mode) {
    return new Promise((res, rej) => {
      $.ajax({
        url: "ws.php?format=json&method=pwg.categories.delete",
        type: "POST",
        data: {
          category_id: album_id,
          photo_deletion_mode: photo_deletion_mode,
          pwg_token : pwg_token,
        },
        success: function (raw_data) {
          res()
        },
        error: function(message) {
          rej(message)
        }
      });
    })
  }

  $('#refreshRepresentative').on('click', function(e) {
    var method = 'pwg.categories.refreshRepresentative';

    $('#refreshRepresentative i').removeClass("icon-ccw").addClass("icon-spin6").addClass("animate-spin")

    jQuery.ajax({
      url: "ws.php?format=json&method="+method,
      type:"POST",
      data: {
        category_id: album_id
      },
      success:function(data) {
        var data = jQuery.parseJSON(data);
        if (data.stat == 'ok') {
          jQuery("#deleteRepresentative").show();

          jQuery(".cat-modify-representative")
            .attr('style', `background-image:url('${data.result.src}')`)
            .removeClass('icon-dice-solid')
          
          }
          else {
            console.error(data);
          }
          $('#refreshRepresentative i').addClass("icon-ccw").removeClass("icon-spin6").removeClass("animate-spin")
      },
      error:function(XMLHttpRequest, textStatus, errorThrows) {
        console.error(errorThrows);
        $('#refreshRepresentative i').addClass("icon-ccw").removeClass("icon-spin6").removeClass("animate-spin")
      }
    });

    e.preventDefault();
  });

  $('#deleteRepresentative').on('click',  function(e) {
    var method = 'pwg.categories.deleteRepresentative';

    $('#deleteRepresentative i').removeClass("icon-cancel").addClass("icon-spin6").addClass("animate-spin")

    jQuery.ajax({
      url: "ws.php?format=json&method="+method,
      type:"POST",
      data: {
        category_id: album_id
      },
      success:function(data) {
        var data = jQuery.parseJSON(data);
        if (data.stat == 'ok') {
          jQuery("#deleteRepresentative").hide();
          jQuery(".cat-modify-representative")
            .attr('style', ``)
            .addClass('icon-dice-solid')
        }
        else {
          console.error(data);
        }
        $('#deleteRepresentative i').addClass("icon-cancel").removeClass("icon-spin6").removeClass("animate-spin")
      },
      error:function(XMLHttpRequest, textStatus, errorThrows) {
        console.error(errorThrows);
        $('#deleteRepresentative i').addClass("icon-cancel").removeClass("icon-spin6").removeClass("animate-spin")
      }
    });

    e.preventDefault();
  });
});


