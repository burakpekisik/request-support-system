# SQL Sorguları

Bu belge, projedeki tüm SQL sorgularını ve açıklamalarını içerir.

## AdminDashboardRepository.java

### SELECT

- `SELECT COUNT(DISTINCT id) FROM users`: Toplam kullanıcı sayısını alır.
- `SELECT CASE WHEN last_month = 0 THEN 0 ELSE ((this_month - last_month) * 100.0 / last_month) END FROM (SELECT SUM(CASE WHEN created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN 1 ELSE 0 END) AS this_month, SUM(CASE WHEN created_at >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN 1 ELSE 0 END) AS last_month FROM users) t`: Aylık toplam kullanıcı değişim yüzdesini hesaplar.
- `SELECT COUNT(DISTINCT id) FROM requests`: Toplam istek sayısını alır.
- `SELECT CASE WHEN last_month = 0 THEN 0 ELSE ((this_month - last_month) * 100.0 / last_month) END FROM (SELECT SUM(CASE WHEN created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN 1 ELSE 0 END) AS this_month, SUM(CASE WHEN created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN 1 ELSE 0 END) AS last_month FROM requests) t`: Aylık toplam istek değişim yüzdesini hesaplar.
- `SELECT COUNT(*) AS total_resolved_requests FROM requests WHERE current_status_id IN (7, 8) AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND created_at < DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')`: Bu ay çözülen isteklerin sayısını alır.
- `SELECT CASE WHEN last_month = 0 THEN 0 ELSE ((this_month - last_month) * 100.0 / last_month) END FROM (SELECT SUM(CASE WHEN current_status_id IN (7, 8) AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN 1 ELSE 0 END) AS this_month, SUM(CASE WHEN current_status_id IN (7, 8) AND created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN 1 ELSE 0 END) AS last_month FROM requests) t`: Aylık çözülen isteklerin değişim yüzdesini hesaplar.
- `SELECT COUNT(*) AS total_pending_requests FROM requests WHERE current_status_id = 1`: Bekleyen isteklerin toplam sayısını alır.
- `SELECT CASE WHEN last_month = 0 THEN 0 ELSE ((this_month - last_month) * 100.0 / last_month) END FROM (SELECT SUM(CASE WHEN current_status_id = 1 AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN 1 ELSE 0 END) AS this_month, SUM(CASE WHEN current_status_id = 1 AND created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN 1 ELSE 0 END) AS last_month FROM requests) t`: Aylık bekleyen isteklerin değişim yüzdesini hesaplar.
- `SELECT u.name AS unit_name, COUNT(r.id) AS request_count FROM units u LEFT JOIN requests r ON r.category_id = u.id GROUP BY u.id, u.name ORDER BY request_count DESC LIMIT 5`: Birimlere göre istek sayılarını alır ve en çok istek alan 5 birimi listeler.
- `getRequestsWithFilters`: Durum ve birim filtresine göre istekleri sayfalayarak getiren dinamik bir sorgu oluşturur.
    - **COUNT Query:** `SELECT COUNT(*) as total FROM requests r JOIN statuses s ON r.current_status_id = s.id JOIN units u ON r.unit_id = u.id WHERE r.current_status_id = ? AND u.name = ?`
    - **DATA Query:** `SELECT r.id, r.title, ... FROM requests r JOIN statuses s ON r.current_status_id = s.id JOIN units u ON r.unit_id = u.id JOIN priorities p ON r.priority_id = p.id JOIN users req ON r.requester_id = req.id WHERE r.current_status_id = ? AND u.name = ? ORDER BY r.created_at DESC LIMIT ? OFFSET ?`
- `getUsersWithFilters`: Arama ve rol filtresine göre kullanıcıları sayfalayarak getiren dinamik bir sorgu oluşturur.
    - **COUNT Query:** `SELECT COUNT(DISTINCT u.id) as total FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.id WHERE (u.first_name LIKE ? OR u.last_name LIKE ? OR u.tc_number LIKE ? OR u.email LIKE ?) AND r.name = ?`
    - **DATA Query:** `SELECT DISTINCT u.id, u.tc_number, ... FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.id WHERE (u.first_name LIKE ? OR u.last_name LIKE ? OR u.tc_number LIKE ? OR u.email LIKE ?) AND r.name = ? ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
- `SELECT u.id, u.name FROM units u INNER JOIN officer_unit_assignments oua ON u.id = oua.unit_id WHERE oua.user_id = ?`: Bir memurun atandığı birimleri alır.
- `SELECT id, name, description FROM units WHERE is_active = 1 ORDER BY name`: Aktif tüm birimleri alır.

### INSERT

- `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`: Bir kullanıcıya yeni bir rol atar.
- `INSERT INTO officer_unit_assignments (user_id, unit_id) VALUES (?, ?)`: Bir memura yeni bir birim atar.

### UPDATE

- `updateUserRole(Long userId, Integer roleId)`: Bir kullanıcının rolünü günceller (önce siler, sonra ekler).
- `assignUserToUnits(Long userId, List<Integer> unitIds)`: Bir memurun birimlerini günceller (önce siler, sonra ekler).

### DELETE

- `DELETE FROM user_roles WHERE user_id = ?`: Bir kullanıcının tüm rollerini siler.
- `DELETE FROM officer_unit_assignments WHERE user_id = ?`: Bir memurun tüm birim atamalarını siler.

## AttachmentRepository.java

### SELECT

- `SELECT * FROM attachments WHERE request_id = ? ORDER BY created_at DESC`: Bir isteğe ait tüm ekleri alır.
- `SELECT * FROM attachments WHERE timeline_id = ? ORDER BY created_at ASC`: Bir zaman çizelgesi kaydına ait tüm ekleri alır.
- `SELECT * FROM attachments WHERE uploader_id = ? ORDER BY created_at DESC`: Bir kullanıcının yüklediği tüm ekleri alır.
- `SELECT * FROM attachments WHERE request_id = ? AND timeline_id IS NULL ORDER BY created_at ASC`: Bir isteğin ana gövdesine eklenmiş ekleri alır (zaman çizelgesiyle ilişkili olmayanlar).

### INSERT

- `INSERT INTO attachments (request_id, uploader_id, timeline_id, file_name, file_path, file_type, file_size_mb, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`: Yeni bir ek kaydı oluşturur.

## LookupRepository.java

### SELECT

- `SELECT * FROM units WHERE is_active = 1`: Aktif olan tüm birimleri alır.
- `SELECT * FROM categories WHERE is_active = 1`: Aktif olan tüm kategorileri alır.
- `SELECT * FROM statuses`: Tüm durumları alır.
- `SELECT * FROM priorities ORDER BY level ASC`: Tüm öncelikleri seviyelerine göre sıralı olarak alır.

## RequestRepository.java

### SELECT

- `SELECT r.id, r.title, ... FROM requests r ... WHERE r.requester_id = ? ORDER BY r.created_at DESC`: Bir öğrencinin isteklerini listeler.
- `findRequestsByUnitIds`: Birim kimliklerine göre istekleri getiren dinamik bir sorgu oluşturur.
    - **Query:** `SELECT r.id, r.title, ... FROM requests r ... WHERE r.unit_id IN (?,?,?) ORDER BY r.created_at ASC`
- `SELECT ..., r.id, r.title, ... FROM requests r ... WHERE oua.user_id = ? AND s.is_final = FALSE AND r.assigned_officer_id IS NULL ORDER BY p.level DESC, r.created_at ASC LIMIT ?`: Bir memurun birimlerindeki bekleyen istekleri alır.
- `SELECT ..., r.id, r.title, ... FROM requests r ... WHERE r.assigned_officer_id = ? AND s.is_final = FALSE ORDER BY p.level DESC, r.updated_at DESC LIMIT ?`: Bir memura atanmış ve devam eden istekleri alır.
- `SELECT COUNT(*) FROM requests r ... WHERE oua.user_id = ? AND s.name = 'Beklemede' AND r.assigned_officer_id IS NULL`: Bir memurun birimlerindeki yeni (beklemede) isteklerin sayısını alır.
- `SELECT COUNT(*) FROM requests r ... WHERE r.assigned_officer_id = ? AND s.is_final = FALSE`: Bir memura atanmış ve devam eden isteklerin sayısını alır.
- `SELECT COUNT(*) FROM requests r ... WHERE r.assigned_officer_id = ? AND s.name = 'Çözüldü' AND DATE(r.updated_at) = CURDATE()`: Bir memurun o gün çözdüğü isteklerin sayısını alır.
- `SELECT COUNT(DISTINCT rt.request_id) FROM request_timeline rt ... WHERE rt.actor_id = ? AND rt.comment LIKE '%transfer%' AND rt.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`: Bir memurun son 7 gün içinde transfer ettiği isteklerin sayısını alır.
- `calculateNewRequestsTrend`: Bir memurun birimlerine gelen yeni isteklerin bu ay ve geçen ay arasındaki değişim yüzdesini hesaplayan dinamik bir sorgu.
- `calculateResolvedTodayTrend`: Bir memurun çözdüğü isteklerin bu ay ve geçen ay arasındaki değişim yüzdesini hesaplayan dinamik bir sorgu.
- `findInboxRequestsWithFilters`: Bir memurun gelen kutusundaki istekleri filtreleyen, sıralayan ve sayfalayan dinamik bir sorgu.
- `findAssignedRequests`: Bir memura atanmış istekleri filtreleyen, sıralayan ve sayfalayan dinamik bir sorgu.
- `findMyRequests`: Bir kullanıcının kendi oluşturduğu istekleri filtreleyen, sıralayan ve sayfalayan dinamik bir sorgu.
- `SELECT id, name, description FROM categories WHERE is_active = 1 ORDER BY name ASC`: Aktif kategorileri alır.
- `SELECT id, name, description FROM units WHERE is_active = 1 ORDER BY name ASC`: Aktif birimleri alır.
- `SELECT ..., r.id, r.title, ... FROM requests r ... WHERE r.id = ?`: Kimliğine göre tek bir isteğin detaylarını alır.
- `SELECT current_status_id FROM requests WHERE id = ?`: Bir isteğin mevcut durum kimliğini alır.
- `SELECT priority_id FROM requests WHERE id = ?`: Bir isteğin öncelik kimliğini alır.
- `findRecentByRequesterId`: Bir öğrencinin son isteklerini alır.
- `countTotalByRequesterId`: Bir öğrencinin toplam istek sayısını alır.
- `countActiveByRequesterId`: Bir öğrencinin aktif istek sayısını alır.
- `countPendingByRequesterId`: Bir öğrencinin bekleyen istek sayısını alır.
- `countResolvedByRequesterId`: Bir öğrencinin çözülmüş istek sayısını alır.
- `calculateTotalRequestsTrendByRequester`: Bir öğrencinin toplam isteklerinin aylık trendini hesaplar.
- `calculateActiveRequestsTrendByRequester`: Bir öğrencinin aktif isteklerinin aylık trendini hesaplar.
- `calculateResolvedRequestsTrendByRequester`: Bir öğrencinin çözülmüş isteklerinin aylık trendini hesaplar.

### INSERT

- `INSERT INTO requests (requester_id, unit_id, category_id, priority_id, current_status_id, title, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`: Yeni bir istek oluşturur.

### UPDATE

- `UPDATE requests SET current_status_id = ?, assigned_officer_id = ?, updated_at = NOW() WHERE id = ?`: Bir isteğin durumunu ve atanan memurunu günceller.
- `UPDATE requests SET current_status_id = ?, updated_at = NOW() WHERE id = ?`: Bir isteğin sadece durumunu günceller.
- `UPDATE requests SET priority_id = ?, updated_at = NOW() WHERE id = ?`: Bir isteğin önceliğini günceller.

## RoleRepository.java

### SELECT

- `SELECT * FROM roles WHERE name = ?`: İsmine göre bir rolü alır.
- `SELECT * FROM roles WHERE id = ?`: Kimliğine göre bir rolü alır.
- `SELECT * FROM roles`: Tüm rolleri alır.

## TimelineRepository.java

### SELECT

- `SELECT t.*, u.first_name, u.last_name FROM request_timeline t JOIN users u ON t.actor_id = u.id WHERE t.request_id = ? ORDER BY t.created_at ASC`: Bir isteğe ait tüm zaman çizelgesi olaylarını, olayı gerçekleştiren kullanıcının adıyla birlikte alır.

### INSERT

- `INSERT INTO request_timeline (request_id, actor_id, previous_status_id, new_status_id, comment, created_at) VALUES (?, ?, ?, ?, ?, NOW())`: Bir istek için yeni bir zaman çizelgesi olayı ekler.

## UserRepository.java

### SELECT

- `SELECT * FROM users WHERE tc_number = ?`: TC kimlik numarasına göre bir kullanıcıyı alır.
- `SELECT * FROM users WHERE email = ?`: E-posta adresine göre bir kullanıcıyı alır.
- `SELECT * FROM users WHERE id = ?`: Kimliğine göre bir kullanıcıyı alır.
- `SELECT COUNT(*) FROM users WHERE tc_number = ?`: Belirtilen TC kimlik numarasının mevcut olup olmadığını kontrol eder.
- `SELECT COUNT(*) FROM users WHERE email = ?`: Belirtilen e-posta adresinin mevcut olup olmadığını kontrol eder.
- `SELECT unit_id FROM officer_unit_assignments WHERE user_id = ?`: Bir memurun atandığı birimlerin kimliklerini alır.
- `SELECT u.name FROM units u JOIN officer_unit_assignments oua ON u.id = oua.unit_id WHERE oua.user_id = ?`: Bir memurun atandığı birimlerin isimlerini alır.
- `SELECT DISTINCT ... FROM users u ...`: Bir birime atanmış veya atanmamış memurları alır.
- `SELECT unit_id FROM officer_unit_assignments WHERE user_id = ?`: Bir memurun atandığı birimlerin kimliklerini alır (tekrarlı).
- `SELECT COUNT(*) FROM users WHERE email = ? AND id != ?`: Bir e-postanın, belirtilen kullanıcı dışında başka bir kullanıcı tarafından kullanılıp kullanılmadığını kontrol eder.

### INSERT

- `INSERT INTO users (tc_number, email, password_hash, first_name, last_name, phone_number, avatar_url, created_at, is_active) ...`: Yeni bir kullanıcı oluşturur.

### UPDATE

- `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone_number = ? WHERE id = ?`: Bir kullanıcının profil bilgilerini günceller.
- `UPDATE users SET avatar_url = ? WHERE id = ?`: Bir kullanıcının avatar URL'sini günceller.

## UserRoleRepository.java

### SELECT

- `SELECT r.* FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`: Bir kullanıcının rollerini alır.
- `SELECT COUNT(*) FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ? AND r.name = ?`: Bir kullanıcının belirli bir role sahip olup olmadığını kontrol eder.

### INSERT

- `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`: Bir kullanıcıya bir rol atar.

### DELETE

- `DELETE FROM user_roles WHERE user_id = ?`: Bir kullanıcının tüm rollerini siler.