<?php
class Validator {
    private $errors = [];
    
    public function validate($data, $rules) {
        foreach ($rules as $field => $rule) {
            $ruleParts = explode('|', $rule);
            
            foreach ($ruleParts as $rulePart) {
                $this->applyRule($data, $field, $rulePart);
            }
        }
        
        return empty($this->errors);
    }
    
    private function applyRule($data, $field, $rule) {
        $value = $data[$field] ?? null;
        
        if ($rule === 'required' && empty($value)) {
            $this->errors[$field][] = "The $field field is required.";
            return;
        }
        
        if ($rule === 'string' && !is_string($value)) {
            $this->errors[$field][] = "The $field must be a string.";
        }
        
        if ($rule === 'integer' && !is_int($value)) {
            $this->errors[$field][] = "The $field must be an integer.";
        }
        
        if ($rule === 'array' && !is_array($value)) {
            $this->errors[$field][] = "The $field must be an array.";
        }
        
        if (preg_match('/^min:(\d+)$/', $rule, $matches) && is_int($value)) {
            $min = (int)$matches[1];
            if ($value < $min) {
                $this->errors[$field][] = "The $field must be at least $min.";
            }
        }
        
        if ($rule === 'date_dmy' && !$this->isValidDate($value, 'd/m/Y')) {
            $this->errors[$field][] = "The $field must be in dd/mm/yyyy format.";
        }
    }
    
    private function isValidDate($date, $format) {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }
    
    public function getErrors() {
        return $this->errors;
    }
}
?>