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
      },
      error:function(XMLHttpRequest, textStatus, errorThrows) {
        save_button_set_loading(false)

        $('.info-error').show()
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

  jQuery(document).on('click', '.refreshRepresentative',  function(e) {
    var $this = jQuery(this);
    var method = 'pwg.categories.refreshRepresentative';

    jQuery.ajax({
      url: "ws.php?format=json&method="+method,
      type:"POST",
      data: {
        category_id: $this.data("category_id")
      },
      success:function(data) {
        var data = jQuery.parseJSON(data);
        if (data.stat == 'ok') {
          jQuery(".deleteRepresentative").show();
          
          jQuery(".albumThumbailImage, .albumThumbnailRandom").on('load', function () {
            cropImage();
          })

          jQuery(".albumThumbailImage, .albumThumbnailRandom")
            .attr('src', data.result.src)
            .end().show();
          
          jQuery(".albumThumbnailRandom").hide();
        }
        else {
          alert("error on "+method);
        }
      },
      error:function(XMLHttpRequest, textStatus, errorThrows) {
        alert("serious error on "+method);
      }
    });

    e.preventDefault();
  });

  jQuery(document).on('click', '.deleteRepresentative',  function(e) {
    var $this = jQuery(this);
    var method = 'pwg.categories.deleteRepresentative';

    jQuery.ajax({
      url: "ws.php?format=json&method="+method,
      type:"POST",
      data: {
        category_id: $this.data("category_id")
      },
      success:function(data) {
        var data = jQuery.parseJSON(data);
        if (data.stat == 'ok') {
          jQuery(".deleteRepresentative").hide();
          jQuery(".albumThumbnailImage").hide();
          jQuery(".albumThumbnailRandom").show();
        }
        else {
          alert("error on "+method);
        }
      },
      error:function(XMLHttpRequest, textStatus, errorThrows) {
        alert("serious error on "+method);
      }
    });

    e.preventDefault();
  });

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

            let message = "<p>" + str_delete_album_and_his_x_subalbums.replace("%s", album_name).replace("%d", nb_sub_albums) + "</p>"

            message += "<p>" + str_album_and_subalbums_contain_x_photos.replace("%d", data.nb_images_recursive) + "</p>"

            if (data.nb_images_recursive != 0) {
              if (data.nb_images_associated_outside != 0) {
                message += "<p>" + str_there_is_x_physically_linked_photos.replace("%d", data.nb_images_recursive + data.nb_images_associated_outside) + "</p>"
              }
              if (data.nb_images_becoming_orphan != 0) {
                message += "<p>" + str_there_is_x_orphan_photos.replace("%d", data.nb_images_becoming_orphan) + "</p>"
              }
            }
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
            delete_album("no_delete")
          },
        },
        deleteAlbumAndOrphans: {
          text: str_delete_album_and_orphans,
          btnClass: 'btn-red',
          action: function () {
            delete_album("delete_orphans")
          },
        },
        deleteAlbumAndPhotos: {
          text:str_delete_album_and_photos,
          btnClass: 'btn-red',
          action: function () {
            delete_album("force_delete")
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
        type: "GET",
        data: {
          category_id: album_id,
          photo_deletion_mode: photo_deletion_mode,
          pwg_token : pwg_token,
        },
        success: function (raw_data) {
          res()
        },
        error: function(message) {
          rej()
        }
      });
    })
  }
});


