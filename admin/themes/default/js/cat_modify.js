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
      dataType: "json",
      data: {
        category_id: album_id,
        name: $("#cat-name").val(),
        comment: $("#cat-comment").val(),
        status: $("#cat-locked").is(":checked")? "public":"private",
        commentable: $("#cat-commentable").is(":checked")? "true":"false",
        apply_commentable_to_subalbums: $("#cat-apply-commentable-on-sub").is(":checked")? "true":"false",
      },
      success:function(data) {
        if (data.stat == "ok") {
          save_button_set_loading(false)

          $('.info-message').show()
          $('.cat-modification .cat-modify-info-subcontent').html(str_just_now)
          $('.cat-modification .cat-modify-info-content').html(str_just_now)
          setTimeout(
            function() {
              $('.info-message').hide()
            }, 
            5000
          )
        } else {
          $('.info-error').show()
          setTimeout(
            function() {
              $('.info-error').hide()
            }, 
            5000
          )
        }
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

    if (parent_album != default_parent_album) {
      jQuery.ajax({
        url: "ws.php?format=json&method=pwg.categories.move",
        type:"POST",
        dataType: "json",
        data: {
          category_id: album_id,
          parent: parent_album,
          pwg_token: pwg_token,
        },
        success: function (data) {
          if (data.stat === "ok") {
            $(".cat-modify-ariane").html(
              data.result.new_ariane_string
            )
            default_parent_album = parent_album;
          } else {
            $('.info-error').show()
            setTimeout(
              function() {
                $('.info-error').hide()
              }, 
              5000
            )
          }
        },
        error: function(e) {
          console.log(e.message);
        }
      });
    }
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
            
            message += `<div class="cat-delete-modes">`;
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
            message += `</div>`;

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

  // Parent album popin
  $("#cat-parent.icon-pencil").on("click", function (e) {
    // Don't open the popin if you click on the album link
    if (e.target.localName != 'a') {
      linked_albums_open();
      set_up_popin();
    }
  });

  $(".limitReached").html(str_no_search_in_progress);
  $(".search-cancel-linked-album").hide();
  $(".linkedAlbumPopInContainer .searching").hide();
  $("#linkedAlbumSearch .search-input").on('input', function () {
    if ($(this).val() != 0) {
      $("#linkedAlbumSearch .search-cancel-linked-album").show()
    } else {
      $("#linkedAlbumSearch .search-cancel-linked-album").hide();
    }

    if ($(this).val().length > 2) {
      linked_albums_search($(this).val());
    } else {
      $(".limitReached").html(str_no_search_in_progress);
      $("#searchResult").empty();
    }
  })

  $(".search-cancel-linked-album").on("click", function () {
    $("#linkedAlbumSearch .search-input").val("");
    $("#linkedAlbumSearch .search-input").trigger("input");
  })

  $(".related-categories-container .breadcrumb-item .remove-item").on("click", function () {
    remove_related_category($(this).attr("id"));
  })
});

// Parent album popin functions
function set_up_popin() {
  $(".ClosePopIn").on('click', function () {
    linked_albums_close();
  });
}

function linked_albums_close() {
  $("#addLinkedAlbum").fadeOut();
}
function linked_albums_open() {
  $("#addLinkedAlbum").fadeIn();
  $(".search-input").val("");
  $(".search-input").focus();
  $("#searchResult").empty();
  $(".limitReached").html(str_no_search_in_progress);
}
function linked_albums_search(searchText) {
  $(".linkedAlbumPopInContainer .searching").show();
  $.ajax({
    url: "ws.php?format=json&method=pwg.categories.getAdminList",
    type: "POST",
    dataType: "json",
    data : {
      search: searchText,
      additional_output: "full_name_with_admin_links",
    },
    before: function () {
      
    },
    success: function (raw_data) {
      $(".linkedAlbumPopInContainer .searching").hide();

      categories = raw_data.result.categories;
      fill_results(categories);

      if (raw_data.result.limit_reached) {
        $(".limitReached").html(str_result_limit.replace("%d", categories.length));
      } else {
        if (categories.length == 1) {
          $(".limitReached").html(str_album_found);
        } else {
          $(".limitReached").html(str_albums_found.replace("%d", categories.length));
        }
      }
    },
    error: function (e) {
      $(".linkedAlbumPopInContainer .searching").hide();
      console.log(e.message);
    }
  })
}

function fill_results(cats) {
  $("#searchResult").empty();
  cats.forEach(cat => {
    $("#searchResult").append(
    "<div class='search-result-item'>" +
      "<span class='search-result-path'>" + cat.fullname +"</span><span id="+ cat.id + " class='icon-plus-circled item-add'></span>" +
    "</div>"
    );

    // If the searched albums are in the children of the current album they become unclickable
    // Same if the album is already selected

    if (parent_album == cat.id || cat.uppercats.split(',').includes(album_id+"")) {
      $(".search-result-item #"+ cat.id +".item-add").addClass("notClickable").attr("title", str_already_in_related_cats).on("click", function (event) {
        event.preventDefault();
      });
    } else {
      $(".search-result-item #"+ cat.id +".item-add").on("click", function () {
        add_related_category(cat.id, cat.full_name_with_admin_links);
      });
    }
  });
}

function remove_related_category(cat_id) {
  $(".invisible-related-categories-select option[value="+ cat_id +"]").remove();
  $("#" + cat_id).parent().remove();

  cat_to_remove_index = related_categories_ids.indexOf(cat_id);
  if (cat_to_remove_index > -1) {
    related_categories_ids.splice(cat_to_remove_index, 1);
  }

  check_related_categories();
}

function add_related_category(cat_id, cat_link_path) {
  if (parent_album != cat_id) {

    $("#cat-parent").html(
      cat_link_path
    );

    $(".search-result-item #" + cat_id).addClass("notClickable");
    parent_album = cat_id;
    $(".invisible-related-categories-select").append("<option selected value="+ cat_id +"></option>");

    $("#"+ cat_id).on("click", function () {
      remove_related_category($(this).attr("id"))
    })

    linked_albums_close();
  }
}