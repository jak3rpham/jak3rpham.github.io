/**
 * VITALITÉ — script cho Appearance → Vitalité
 *
 * Ba việc, không hơn:
 *   1. Mở Media Library để chọn ảnh
 *   2. Kéo thả sắp xếp gallery
 *   3. Chuyển tab ngôn ngữ cho phần chữ hero
 *
 * CHỈ CHẠY TRONG WP-ADMIN. Không có dòng nào ở đây tới được frontend, nên nó
 * không ảnh hưởng LCP.
 *
 * VÌ SAO PHẢI ĐÁNH SỐ LẠI SAU MỖI THAY ĐỔI
 *   Tên field mang chỉ số: vt_home[gallery][2][id]. Kéo thả hay xoá mà không
 *   đánh số lại thì PHP nhận về mảng thủng lỗ hoặc trùng khoá, và thứ tự trên
 *   màn hình khác thứ tự lưu xuống. Đó là loại lỗi chỉ lộ ra sau khi bấm Lưu.
 */
(function ($) {
  'use strict';

  var $gal = $('#vt-gal');
  if (!$gal.length) { return; }

  var NAME  = $gal.data('name');
  var LANGS = String($gal.data('langs') || 'en').split(',');
  var SIZES = (window.VT_ADMIN && VT_ADMIN.sizes) || { '1x1': 'Normal' };
  var T     = window.VT_ADMIN || {};

  /* ------------------------------------------------------------ tiện ích */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /** Đánh số lại toàn bộ name của gallery theo đúng thứ tự đang thấy. */
  function reindex() {
    $gal.children('li').each(function (i) {
      $(this).attr('data-i', i);
      $(this).find('[name]').each(function () {
        var n = $(this).attr('name');
        // vt_home[gallery][<bất kỳ>][...]  ->  vt_home[gallery][i][...]
        $(this).attr('name', n.replace(
          new RegExp('^' + NAME + '\\[gallery\\]\\[[^\\]]*\\]'),
          NAME + '[gallery][' + i + ']'
        ));
      });
    });
  }

  /** Dựng một ô gallery mới. */
  function cell(att) {
    var i   = $gal.children('li').length;
    var src = (att.sizes && (att.sizes.medium || att.sizes.thumbnail) || {}).url || att.url;
    var h   = '';

    h += '<li data-i="' + i + '">';
    h += '<input type="hidden" name="' + NAME + '[gallery][' + i + '][id]" value="' + esc(att.id) + '">';
    h += '<button type="button" class="vt-del" aria-label="' + esc(T.remove) + '">&times;</button>';
    h += '<img class="vt-ph" src="' + esc(src) + '" alt="">';
    h += '<label>Cell size</label>';
    h += '<select name="' + NAME + '[gallery][' + i + '][size]">';
    Object.keys(SIZES).forEach(function (k) {
      h += '<option value="' + esc(k) + '">' + esc(SIZES[k]) + '</option>';
    });
    h += '</select>';
    LANGS.forEach(function (lang) {
      h += '<label>Alt text (' + esc(lang.toUpperCase()) + ')</label>';
      h += '<input type="text" name="' + NAME + '[gallery][' + i + '][alt][' + esc(lang) + ']"' +
           ' value="' + esc(att.alt || '') + '">';
    });
    h += '</li>';
    return h;
  }

  /* ------------------------------------------------- 1. Thêm ảnh gallery */

  var galFrame = null;

  $('#vt-gal-add').on('click', function (e) {
    e.preventDefault();

    // Dựng lại frame mỗi lần mở. Dùng lại frame cũ thì nó nhớ lựa chọn lần
    // trước và người dùng vô tình thêm trùng ảnh mà không nhận ra.
    galFrame = wp.media({
      title:    T.pickTitle || 'Choose images',
      button:   { text: T.pickButton || 'Use these' },
      library:  { type: 'image' },
      multiple: 'add'
    });

    galFrame.on('select', function () {
      var picked = galFrame.state().get('selection').toJSON();
      picked.forEach(function (att) { $gal.append(cell(att)); });
      reindex();
    });

    galFrame.open();
  });

  /* ------------------------------------------------------- 2. Xoá một ô */

  $gal.on('click', '.vt-del', function () {
    if (!window.confirm(T.confirmDel || 'Remove?')) { return; }
    $(this).closest('li').remove();
    reindex();
  });

  /* ---------------------------------------------------- 3. Kéo thả sắp xếp */

  if ($.fn.sortable) {
    $gal.sortable({
      items:       '> li',
      handle:      '.vt-ph',   // kéo bằng ảnh, để còn bấm được vào select và input
      placeholder: 'vt-gal-ph',
      tolerance:   'pointer',
      update:      reindex
    });
  }

  /* ----------------------------------------------- 4. Chọn ảnh cho hero */

  $('.vt-hero-pick').on('click', function (e) {
    e.preventDefault();
    var $btn = $(this);
    var $box = $btn.closest('.vt-slide');

    var frame = wp.media({
      title:    T.pickOne || 'Choose an image',
      button:   { text: T.useOne || 'Use this image' },
      library:  { type: 'image' },
      multiple: false
    });

    frame.on('select', function () {
      var att = frame.state().get('selection').first().toJSON();
      var src = (att.sizes && (att.sizes.medium || att.sizes.thumbnail) || {}).url || att.url;
      $box.find('.vt-hero-id').val(att.id);
      $box.find('.vt-hero-thumb').attr('src', src);
    });

    frame.open();
  });

  /* ------------------------------------------------- 5. Tab ngôn ngữ hero */

  $('.vt-langtabs button').on('click', function () {
    var $b    = $(this);
    var group = $b.parent().data('target');
    var lang  = $b.data('lang');

    $b.parent().children('button').removeClass('is-on');
    $b.addClass('is-on');

    $('.vt-langpane[data-group="' + group + '"]').each(function () {
      this.hidden = ($(this).data('lang') !== lang);
    });
  });

}(jQuery));
