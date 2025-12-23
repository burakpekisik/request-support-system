package com.ceng454.request_support_system.service;

import com.ceng454.request_support_system.model.Unit;
import com.ceng454.request_support_system.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;

    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }

    public void addUnit(String name, String description) {
        unitRepository.add(name, description);
    }

    public boolean updateUnit(Unit unit) {
        Optional<Unit> existingUnit = unitRepository.findById(unit.getId());
        if (existingUnit.isPresent()) {
            unitRepository.update(unit);
            return true;
        }
        return false;
    }

    public void deleteUnit(Integer id) {
        unitRepository.setActivity(id, false);
    }
    
    public void activateUnit(Integer id) {
        unitRepository.setActivity(id, true);
    }
}
