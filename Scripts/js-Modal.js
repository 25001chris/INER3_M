$(function () {
    //<!-- Modal -->
    var modal = '<div class="modal-dialog d-flex justify-content-center">';
    //<!-- Modal content-->
    modal += '<div class="modal-content">';
    modal += '<div class="modal-header">';
    modal += '<h4 id="modalTitle" class="modal-title"></h4>';
    modal += '<button type="button" class="close" data-dismiss="modal">&times;</button>';
    modal += '</div>';
    modal += '<div class="modal-body">';
    modal += '<p id="modalMsg"></p>';
    modal += '</div>';
    modal += '<div class="modal-footer">';
    modal += '<button type="button" class="btn-box" data-dismiss="modal">確定</button>';
    modal += '</div>';
    modal += '</div>';
    modal += '</div>';

    var modalDiv = document.createElement('div');
    modalDiv.id = 'msgModal';
    modalDiv.className = 'modal fade';
    $(modalDiv).attr('role', 'dialog');
    $(modalDiv).html(modal);

    //<!-- confirm-Modal -->
    var confirmModal = document.createElement('div');
    confirmModal.id = 'confirmModal';

    $('body')[0].appendChild(modalDiv);
    $('body')[0].appendChild(confirmModal);
});

function showMsg(title, msg, func, sz) {
    var szCss = '';

    switch (sz) {
        case 'sm':
            szCss = 'modal-sm';
            break;
        case 'lg':
            szCss = 'modal-lg';
            break;
        default:
            szCss = '';
            break;
    }

    if (szCss !== '')
        $('.modal-dialog').addClass(szCss);

    $('#modalTitle').html(title);
    $('#modalMsg').html(msg);
    $('#msgModal').modal('toggle');

    $('#msgModal').off("hidden.bs.modal", null);

    $('#msgModal').on('hidden.bs.modal', function () {
        $(".modal-dialog").attr("class", "modal-dialog d-flex justify-content-center");  //初始化
        if (func)
            func();

        if (szCss !== '')
            $('.modal-dialog').removeClass(szCss);
    });
}

function showMsgSm(title, msg, func) {
    showMsg(title, msg, func, 'sm');
}

function showMsgLg(title, msg, func) {
    showMsg(title, msg, func, 'lg');
}

function showConfirm(title, msg, callback) {
    var deleteConfirm = function () {
        $('body').removeClass('modal-open');
        $('div[id^="confirmModal"]').each(function () {
            if (this.id !== 'confirmModal') $(this).remove();
        });
    };

    var confirmCallback = function () {
        callback();
        deleteConfirm();
    };

    $('#confirmModal').confirmModal({
        confirmTitle: title,
        confirmMessage: msg,
        confirmOk: '確定',
        confirmCancel: '取消',
        confirmDirection: 'rtl',
        confirmStyle: 'success',
        confirmCallback: confirmCallback,
        confirmDismiss: true,
        confirmAutoOpen: true
    });

    $('div[id^="confirmModal"] .modal-dialog').addClass('modal-sm');
    $('div[id^="confirmModal"]').on('hidden.bs.modal', function () {
        deleteConfirm();
    });
}