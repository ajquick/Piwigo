{combine_script id='common' load='footer' path='admin/themes/default/js/common.js'}
{combine_script id='cat_modify' load='footer' path='admin/themes/default/js/cat_modify.js'}
{combine_script id='jquery.confirm' load='footer' require='jquery' path='themes/default/js/plugins/jquery-confirm.min.js'}
{combine_css path="themes/default/js/plugins/jquery-confirm.min.css"}
{combine_css path="admin/themes/default/fontello/css/animation.css" order=10} {* order 10 is required, see issue 1080 *}
{combine_script id='jquery.tipTip' load='footer' path='themes/default/js/plugins/jquery.tipTip.minified.js'}

{footer_script}
const album_id = {$CAT_ID}
const album_name = "{$CAT_NAME}"
const nb_sub_albums = {$NB_SUBCATS}
const pwg_token = '{$PWG_TOKEN}'
const u_delete = '{$U_DELETE}'

const str_cancel = '{'No, I have changed my mind'|@translate|@escape}'
const str_delete_album = '{'Delete album'|@translate|escape:javascript}'
const str_delete_album_and_his_x_subalbums = '{'Delete album "%s" and its %d sub-albums.'|@translate|escape:javascript}'

const str_dont_delete_photos = '{'delete only album, not photos'|@translate|escape:javascript}';
const str_delete_orphans = '{'delete album and the %d orphan photos'|@translate|escape:javascript}';
const str_delete_all_photos = '{'delete album and all %d photos, even the %d associated to other albums'|@translate|escape:javascript}';
{/footer_script}

<div class="cat-modify">

  <div class="cat-modify-header">
    <div class="cat-modify-ariane icon-flow-tree">
      {$CATEGORIES_NAV}
    </div>

    <div class="cat-modify-actions">
      {if cat_admin_access($CAT_ID)}
        <a class="icon-eye tiptip" href="{$U_JUMPTO}" title="{'Open in gallery'|@translate}"></a>
      {/if}

      {if isset($U_MANAGE_ELEMENTS) }
        <a class="icon-picture tiptip" href="{$U_MANAGE_ELEMENTS}" title="{'Manage album photos'|@translate}"></a>
      {/if}

      <a class="icon-plus-circled tiptip" href="{$U_ADD_PHOTOS_ALBUM}" title="{'Add Photos'|translate}"></a>

      <a class="icon-sitemap tiptip" href="{$U_MOVE}" title="{'Manage sub-albums'|@translate}"></a>

      {if isset($U_SYNC) }
        <a class="icon-exchange tiptip" href="{$U_SYNC}" title="{'Synchronize'|@translate}"></a>
      {/if}

      {if isset($U_DELETE) }
        <a class="icon-trash deleteAlbum tiptip" href="#" title="{'Delete album'|@translate}"></a>
      {/if} 
    </div>
  </div>

  <div class="cat-modify-content">

    <div class="cat-modify-infos">
      {if isset($INFO_CREATION)}
      <div class="cat-modify-info-card">
        <span class="cat-modify-info-title">{'Created'|@translate}</span>
        <span class="cat-modify-info-content">{$INFO_CREATION_SINCE}</span>
        <span class="cat-modify-info-subcontent">{$INFO_CREATION}</span>
      </div>
      {/if}
      <div class="cat-modify-info-card">
        <span class="cat-modify-info-title">{'Modified'|@translate}</span>
        <span class="cat-modify-info-content">{$INFO_LAST_MODIFIED_SINCE}</span>
        <span class="cat-modify-info-subcontent">{$INFO_LAST_MODIFIED}</span>
      </div>
      {if isset($INFO_PHOTO)}
      <div title="{$INFO_TITLE}" class="cat-modify-info-card">
        <span class="cat-modify-info-title">{'Photos'|@translate}</span>
        <span class="cat-modify-info-content">{$INFO_PHOTO}</span>
      </div>
      {/if}
      {if isset($INFO_DIRECT_SUB)}
      <div class="cat-modify-info-card">
        <span class="cat-modify-info-title">{'Sub-albums'|@translate}</span>
        <span class="cat-modify-info-content">{$INFO_DIRECT_SUB}</span>
      </div>
      {/if}
      {if isset($U_SYNC) }
      <div class="cat-modify-info-card">
        <span class="cat-modify-info-title">{'Directory'}</span>
        <span class="cat-modify-info-content">{$CAT_FULL_DIR}</span>
      </div>$CAT_NAME
      {/if}
    </div>

    <div 
      class="cat-modify-representative {if !isset($representant)}icon-file-image{elseif !isset($representant.picture)}icon-dice-solid{/if}" 
      {if !isset($representant)}title="{'No photos in the current album, no thumbnail available'|@translate}"{/if} 
      {if isset($representant) && isset($representant.picture)}style="background-image:url('{$representant.picture.src}')"{/if}
      >
      {if $representant.ALLOW_SET_RANDOM || $representant.ALLOW_SET_RANDOM}
      <div class="cat-modify-representative-actions">
        {if $representant.ALLOW_SET_RANDOM }
          <a class="refreshRepresentative" id="refreshRepresentative" title="{'Find a new representant by random'|@translate}">
            <i class="icon-ccw"></i>
            {'Refresh thumbnail'|@translate}
          </a>
        {/if}
        {if isset($representant.ALLOW_DELETE)}
          <a class="deleteRepresentative " id="deleteRepresentative" title="{'Delete Representant'|@translate}" style="{if !isset($representant.picture)}display:none{/if}">
            <i class="icon-cancel"></i>
            {'Remove thumbnail'|translate}
          </a>
        {/if}
      </div>
      {/if}
    </div>

    <div class="cat-modify-form">
      <div class="cat-modify-input-container">
        <label for="cat-name">{'Name'|@translate}</label>
        <input type="text" id="cat-name" value="{$CAT_NAME}" maxlength="255">
      </div>

      <div class="cat-modify-input-container">
        <label for="cat-comment">{'Description'|@translate}</label>
        <textarea resize="false" rows="5" name="comment" id="cat-comment">{$CAT_COMMENT}</textarea>
      </div>

      {if isset($CAT_COMMENTABLE)}
      <div class="cat-modify-switch-container">
        <div class="switch-input">
          <label class="switch">
            <input type="checkbox" name="commentable" id="cat-commentable" value="true" {if $CAT_COMMENTABLE == "true"}checked{/if}>
            <span class="slider round"></span>
          </label>
        </div>
        <label class="switch-label" for="cat-commentable"><span>{'Authorize comments'|@translate}</span> <i class="icon-help-circled tiptip" title="{'A photo can receive comments from your visitors if it belongs to an album with comments activated.'|@translate}" style="cursor:help"></i></label>
        {if isset($INFO_DIRECT_SUB)}
        <label class="font-checkbox" for="cat-apply-commentable-on-sub">
          <span class="icon-check"></span>
          <input type="checkbox" id="cat-apply-commentable-on-sub">
          {'Apply to sub-albums'|@translate}
        </label>
        {/if}
      </div>
      {/if}

      <div class="cat-modify-switch-container">
        <div class="switch-input">
          <label class="switch">
            <input type="checkbox" name="locked" id="cat-locked" value="true" {if !$IS_LOCKED}checked{/if}>
            <span class="slider round"></span>
          </label>
          
        </div>    
        <label class="switch-label" for="cat-locked"><span>{'Authorize publications'|@translate}</span> <i class="icon-help-circled tiptip" title="{'Locked albums are disabled for maintenance. Only administrators can view them in the gallery. Lock this album will also lock his Sub-albums'|@translate}" style="cursor:help"></i></label>
      </div>
    </div>
  </div>

  <div class="cat-modify-footer">
    <div class="info-message icon-ok">{'Album updated'|@translate}</div>
    <div class="info-error icon-cancel">{'An error has occured while saving album settings'|@translate}</div>
    <span class="buttonLike" id="cat-properties-save"><i class="icon-floppy"></i> {'Save Settings'|@translate}</span>
  </div>
</div>