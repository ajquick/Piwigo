{if empty($load_mode)}{$load_mode='footer'}{/if}
{include file='include/colorbox.inc.tpl' load_mode=$load_mode}

<div id="addLinkedAlbum" class="linkedAlbumPopIn">
  <div class="linkedAlbumPopInContainer">
    <a class="icon-cancel ClosePopIn"></a>
    
    <div class="AddIconContainer">
      <span class="AddIcon icon-blue icon-plus-circled"></span>
    </div>
    <div class="AddIconTitle">
      <span>{$title}</span>
    </div>

    <div id="linkedAlbumSearch">
      <span class='icon-search search-icon'> </span>
      <span class="icon-cancel search-cancel-linked-album"></span>
      <input class='search-input' type='text' placeholder={$searchPlaceholder}>
    </div>
    <div class="limitReached"></div>
    <div class="noSearch"></div>
    <div class="searching icon-spin6 animate-spin"> </div>

    <div id="searchResult">
    </div>
  </div>
</div>