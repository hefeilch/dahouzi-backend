/**
 * Created by CH on 2016/4/4.
 */
var sql = {
//    member
    insertMember: 'insert into tbl_member (memb_nickname,memb_email,memb_password) values(?,?,?)',
    selectMemberById: 'select * from tbl_member where memb_email=? and memb_password=?',
//    setting
    insertClass: 'insert into tbl_classification (clas_title,clas_prime_id,tbl_member_memb_id) values(?,?,?)',
    selectClassAll: 'select * from tbl_classification',
    selectPrimeClassAll: 'select * from tbl_classification where clas_prime_id = ""',
    selectSubClassByPrimeClassId: 'select * from tbl_classification where clas_prime_id = ?',
//    navigation
    insertNavigator: 'insert into tbl_navigator (navi_link,navi_favicon,navi_title,navi_author,navi_description,navi_keywords,navi_prior) values(?,?,?,?,?,?,?)',
    selectNavigatorAll: 'select * from tbl_navigator',
}
module.exports = sql;